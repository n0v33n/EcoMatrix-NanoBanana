# EcoMatrix 🌍🎨

EcoMatrix is a **React + TypeScript single-page application** that empowers anyone to create **AI-generated comics about climate change and environmental solutions**.  
It combines storytelling, personalization, and cutting-edge AI to make climate education inspiring, hopeful, and fun.  

 This project was built as part of my participation in the **Nano Banana Hackathon by Google DeepMind**, showcasing the creative use of Gemini models for interactive storytelling and education.

---

## ✨ Features

- **Two Creation Modes**
  - **Comic Strip:** Generate a single, 4-panel comic image.
  - **3-Page Story:** Create a structured three-part narrative with full-page illustrations.  

- **Character Generator**
  - Define custom heroes, villains, and sidekicks with names, powers, and personalities.
  - **User-as-Hero:** Upload a photo and let AI turn you into the protagonist of your own comic.  

- **AI Editing & Styles**
  - Apply artistic styles like Manga or Western comics.
  - Quick ambiance effects: Day, Night, Rainy, Sunny.
  - Edit with natural language prompts (e.g., “add a tree” or “make it futuristic”).  

- **Interactive UX**
  - Voice input via the Web Speech API.
  - Text-to-speech narration for multi-page stories.
  - Light/Dark themes and an onboarding tutorial.  

- **Persistence & History**
  - Automatic draft saving in localStorage.
  - Prompt history panel for easy reuse.  

- **Export & Share**
  - Download as PNG, export multi-page stories as PDF, or create a single vertical webcomic image.
  - Share instantly with the Web Share API.  

---

## 🧠 AI Models Used

- **gemini-2.5-flash**  
  Text generation, structured story JSON, prompt suggestions, and character analysis.  

- **imagen-4.0-generate-001**  
  High-quality image generation for comics.  

- **gemini-2.5-flash-image-preview (Nano Banana)**  
  Advanced editing and style transfer for comic aesthetics.  

---

## 🚀 How It Works

1. **Start with a Prompt**  
   Type your story idea, use voice input, or let AI suggest one.  

2. **Define Characters (Optional)**  
   Customize your heroes and villains — or become the hero yourself.  

3. **Generate Your Comic**  
   - Quick 4-panel comic strip.  
   - Or, a 3-page illustrated story with narration.  

4. **Refine with AI Editing**  
   Change style, ambiance, or details with a single command.  

5. **Export & Share**  
   Save your creation as PNG, PDF, or vertical comic strip and share with the world.  

---

## 🌍 Why EcoMatrix?

EcoMatrix is designed not just for fun, but to **spark hope and action on climate change**.  
It transforms complex environmental ideas into accessible, visual stories — empowering creators, teachers, and activists to make a difference.  

---


<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1foXSjzeyzKSOlYVHjhBA-7M7QhYaCGDG

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
