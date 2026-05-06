/**
 * Vercel Serverless Function — ClinicalTrials.gov Proxy
 * 
 * Searches for active clinical trials on supplements, herbs, and nutrition.
 * 100% free, no API key required.
 * 
 * GET /api/research/trials?q=ashwagandha&status=RECRUITING&limit=5
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const status = url.searchParams.get('status') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '5'), 10);

  if (!query) {
    return jsonResponse({ success: false, error: 'Query parameter "q" is required' }, 400);
  }

  try {
    let apiUrl = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(query)}&pageSize=${limit}&format=json`;
    
    if (status) {
      apiUrl += `&filter.overallStatus=${encodeURIComponent(status)}`;
    }

    // Request only the fields we need
    apiUrl += '&fields=NCTId,BriefTitle,OverallStatus,Phase,StartDate,CompletionDate,EnrollmentCount,BriefSummary,Condition,InterventionName,LocationCity,LocationState,LocationCountry';

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'MealPlanAssistant/1.0 (info@newmindsgroup.com)',
      },
    });

    if (!response.ok) {
      return jsonResponse({
        success: false,
        error: `ClinicalTrials.gov error: ${response.status}`,
      }, response.status);
    }

    const data = await response.json();
    const studies = (data.studies || []).map(study => {
      const proto = study.protocolSection || {};
      const id = proto.identificationModule || {};
      const status = proto.statusModule || {};
      const design = proto.designModule || {};
      const desc = proto.descriptionModule || {};
      const conditions = proto.conditionsModule || {};
      const interventions = proto.armsInterventionsModule || {};
      const contacts = proto.contactsLocationsModule || {};

      return {
        nctId: id.nctId || '',
        title: id.briefTitle || 'Untitled Study',
        status: status.overallStatus || 'Unknown',
        phase: design.phases?.join(', ') || 'N/A',
        startDate: status.startDateStruct?.date || null,
        completionDate: status.completionDateStruct?.date || null,
        enrollment: design.enrollmentInfo?.count || null,
        summary: (desc.briefSummary || '').substring(0, 300),
        conditions: (conditions.conditions || []).slice(0, 5),
        interventions: (interventions.interventions || []).map(i => ({
          type: i.type,
          name: i.name,
        })).slice(0, 5),
        locations: (contacts.locations || []).slice(0, 3).map(l => ({
          city: l.city,
          state: l.state,
          country: l.country,
        })),
        url: `https://clinicaltrials.gov/study/${id.nctId}`,
      };
    });

    return jsonResponse({
      success: true,
      totalResults: data.totalCount || studies.length,
      query,
      data: studies,
    });
  } catch (error) {
    console.error('[ClinicalTrials Proxy Error]', error);
    return jsonResponse({
      success: false,
      error: 'Failed to search clinical trials',
    }, 500);
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
