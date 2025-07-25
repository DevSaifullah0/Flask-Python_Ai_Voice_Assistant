import google.generativeai as genai

genai.configure(api_key="AIzaSyA80UaJaDMfE5YPnQ9TGoo74GFcMy4oxok")

model = genai.GenerativeModel("gemini-2.5-flash")

def get_ai_response(prompt, language='en'):
    try:
        # Language-specific prefix
        if language == 'hi':
            full_prompt = f"Reply in Hindi:\n{prompt}"
        elif language == 'ur':
            full_prompt = f"Reply in Urdu:\n{prompt}"
        else:
            full_prompt = f"Reply in English:\n{prompt}"

        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        return f"Error from AI: {str(e)}"
