import json

questions = []
id_counter = 1

def add_questions(section, category, q_list):
    global id_counter
    for text in q_list:
        questions.append({
            "id": f"q_{id_counter}",
            "section": section, # "nature" or "deficiency"
            "category": category, # "dopamine", "acetylcholine", "gaba", "serotonin"
            "text": text,
            "type": "boolean"
        })
        id_counter += 1

# NATURE: DOPAMINE (15)
add_questions("nature", "dopamine", [
    "I have a very active imagination and often have new ideas.",
    "I am a very driven person.",
    "I find it easy to focus on details.",
    "I am very good at strategizing and planning.",
    "I consider myself highly competitive.",
    "I easily learn new skills and concepts.",
    "I am known for being a problem solver.",
    "I often feel highly energetic and rarely get fatigued during the day.",
    "I enjoy taking risks and seeking thrills.",
    "I am very self-confident and self-reliant.",
    "I find it easy to stick to a schedule or routine.",
    "I have a high sex drive.",
    "I am very protective of my family and loved ones.",
    "I am highly organized and detail-oriented.",
    "I enjoy being in positions of leadership or authority."
])

# NATURE: ACETYLCHOLINE (15)
add_questions("nature", "acetylcholine", [
    "I have a highly creative mind.",
    "I have an excellent memory, both short-term and long-term.",
    "I am very good at recalling names and faces.",
    "I learn best by reading and absorbing information visually.",
    "I am very intuitive and often 'just know' things.",
    "I enjoy art, music, and cultural experiences.",
    "I am very empathetic and sensitive to others' emotions.",
    "I often think about the meaning of life and philosophical questions.",
    "I am a fast thinker and speak quickly.",
    "I am very observant of my surroundings.",
    "I enjoy working on puzzles or complex mental challenges.",
    "I am naturally optimistic and look at the bright side.",
    "I find it easy to focus on the big picture rather than details.",
    "I am very spontaneous and flexible.",
    "I am considered a very sociable and friendly person."
])

# NATURE: GABA (15)
add_questions("nature", "gaba", [
    "I am a very stable, calm, and practical person.",
    "I rarely get angry or lose my temper.",
    "I am excellent at managing stress.",
    "I enjoy predictable routines and a structured life.",
    "I am known for being very dependable and reliable.",
    "I am a good listener and others often come to me for advice.",
    "I have a calming effect on those around me.",
    "I am very loyal to my friends and family.",
    "I am traditional and value history and established institutions.",
    "I am a team player and prefer collaboration over competition.",
    "I am very patient and don't rush things.",
    "I prefer completing one task fully before starting another.",
    "I am usually happy with what I have and don't crave constant change.",
    "I rarely feel anxious or overwhelmed.",
    "I am very observant of social norms and rules."
])

# NATURE: SEROTONIN (15)
add_questions("nature", "serotonin", [
    "I know how to enjoy myself and have fun.",
    "I am generally in a very good mood.",
    "I am an easygoing person and don't sweat the small stuff.",
    "I enjoy living in the present moment.",
    "I love being physically active and enjoying the outdoors.",
    "I am a very hands-on, tactile person.",
    "I am known for being a loyal friend and partner.",
    "I am very open-minded to new experiences.",
    "I have a very deep, restful sleep every night.",
    "I enjoy a healthy relationship with food and eat a balanced diet.",
    "I am passionate and enjoy a fulfilling romantic life.",
    "I easily let go of grudges and don't hold onto anger.",
    "I am highly adaptable to changing circumstances.",
    "I enjoy socializing, parties, and large gatherings.",
    "I find it very easy to relax when I need to."
])

# DEFICIENCY: DOPAMINE (15)
add_questions("deficiency", "dopamine", [
    "I often feel tired, fatigued, or lack physical energy.",
    "I frequently procrastinate or lack motivation to start tasks.",
    "I have difficulty concentrating or focusing on one thing.",
    "I often feel apathetic or indifferent about things I used to enjoy.",
    "I sometimes feel helpless or hopeless.",
    "I have a tendency to isolate myself from others.",
    "I notice my sex drive has significantly decreased.",
    "I have difficulty making decisions or choices.",
    "I often crave caffeine, sugar, or other stimulants for energy.",
    "I feel a general lack of drive and ambition.",
    "I have a hard time finishing projects I start.",
    "I feel like my thoughts are slow or sluggish.",
    "I have noticed a decrease in my physical coordination or strength.",
    "I struggle with feelings of worthlessness or low self-esteem.",
    "I tend to gain weight easily, especially around my midsection."
])

# DEFICIENCY: ACETYLCHOLINE (15)
add_questions("deficiency", "acetylcholine", [
    "I frequently experience 'brain fog' or mental lack of clarity.",
    "I have noticed a decline in my short-term memory.",
    "I struggle to find the right words when speaking.",
    "I find it hard to learn new things or absorb new information.",
    "I feel like my creativity has significantly diminished.",
    "I often feel distracted or absent-minded.",
    "I have difficulty calculating numbers in my head.",
    "I notice my reaction times are slower than they used to be.",
    "I often misplace items like keys or my phone.",
    "I have a hard time following the plot of a complex movie or book.",
    "I feel less intuitive or 'out of touch' with my gut feelings.",
    "I crave fatty foods or high-cholesterol foods.",
    "I have a dry mouth or dry eyes frequently.",
    "I have noticed a decrease in muscle tone.",
    "I feel less emotionally expressive than I used to."
])

# DEFICIENCY: GABA (15)
add_questions("deficiency", "gaba", [
    "I often feel anxious, nervous, or on edge.",
    "I easily become overwhelmed or stressed by daily tasks.",
    "I have a hard time 'turning off' my mind to relax or sleep.",
    "I frequently worry about things that might happen in the future.",
    "I often feel restless or jittery.",
    "I have a tendency to overthink or obsess over details.",
    "I experience muscle tension or stiffness, especially in the neck and shoulders.",
    "I often feel irritable or easily frustrated.",
    "I have a fast or irregular heartbeat when stressed.",
    "I struggle with feelings of panic or dread without an obvious cause.",
    "I rely on alcohol, drugs, or food to calm down.",
    "I have digestive issues or an 'upset stomach' when stressed.",
    "I feel like I am constantly rushing or in a hurry.",
    "I have a hard time maintaining a consistent daily routine.",
    "I feel ungrounded or out of touch with reality sometimes."
])

# DEFICIENCY: SEROTONIN (15)
add_questions("deficiency", "serotonin", [
    "I frequently experience feelings of depression or deep sadness.",
    "I often feel moody, irritable, or emotionally unstable.",
    "I struggle with insomnia or wake up frequently during the night.",
    "I have strong cravings for carbohydrates, sweets, or salty foods.",
    "I tend to be highly sensitive to pain.",
    "I feel a lack of joy or pleasure in my life.",
    "I am often pessimistic or expect the worst.",
    "I have a short temper or anger easily.",
    "I struggle with obsessive or compulsive thoughts/behaviors.",
    "I experience frequent headaches or migraines.",
    "I feel insecure or have low self-confidence.",
    "I tend to hold grudges and have a hard time forgiving.",
    "I notice my digestion is sluggish or I suffer from constipation.",
    "I feel emotionally fragile and cry easily.",
    "I am overly sensitive to criticism from others."
])

output = {
    "title": "Braverman Nature Assessment",
    "description": "Identify your dominant brain chemistry and potential neurotransmitter imbalances.",
    "questions": questions
}

import os
os.makedirs("src/lib/data", exist_ok=True)
with open("src/lib/data/bravermanQuestions.json", "w") as f:
    json.dump(output, f, indent=2)
print("Saved to src/lib/data/bravermanQuestions.json")
