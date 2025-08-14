import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateBudgetInsights(transactions: any[], familyData: any) {
  try {
    const prompt = `
    Analizuj dane finansowe rodziny i wygeneruj inteligentne podpowiedzi:
    
    Transakcje z ostatnich 30 dni:
    ${JSON.stringify(transactions, null, 2)}
    
    Informacje o rodzinie:
    ${JSON.stringify(familyData, null, 2)}
    
    Wygeneruj 3-5 konkretnych, praktycznych podpowiedzi w języku polskim dotyczących:
    1. Oszczędności i optymalizacji wydatków
    2. Trendów w wydatkach
    3. Rekomendacji dotyczących budżetu
    4. Alertów o potencjalnych problemach
    
    Format odpowiedzi: JSON z tablicą obiektów zawierających:
    - type: "savings" | "alert" | "tip"
    - title: krótki tytuł
    - message: szczegółowy opis
    - priority: "low" | "medium" | "high"
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Jesteś ekspertem finansowym specjalizującym się w zarządzaniu budżetem rodzinnym. Generujesz praktyczne, konkretne podpowiedzi w języku polskim."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const response = completion.choices[0]?.message?.content
    if (response) {
      try {
        return JSON.parse(response)
      } catch {
        // Fallback jeśli JSON jest nieprawidłowy
        return [
          {
            type: "tip",
            title: "Analiza wydatków",
            message: "Przeanalizuj swoje wydatki z ostatnich 30 dni, aby zidentyfikować obszary do oszczędności.",
            priority: "medium"
          }
        ]
      }
    }
  } catch (error) {
    console.error('Błąd OpenAI:', error)
    return []
  }
}

export async function generateExpensePrediction(historicalData: any[]) {
  try {
    const prompt = `
    Na podstawie historycznych danych wydatków, przewidź wydatki na następny miesiąc:
    
    Dane historyczne:
    ${JSON.stringify(historicalData, null, 2)}
    
    Wygeneruj predykcję w formacie JSON:
    {
      "predictedAmount": number,
      "confidence": "high" | "medium" | "low",
      "trend": "increasing" | "decreasing" | "stable",
      "factors": ["czynnik1", "czynnik2"]
    }
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Jesteś ekspertem w analizie danych finansowych i predykcji wydatków."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })

    const response = completion.choices[0]?.message?.content
    if (response) {
      try {
        return JSON.parse(response)
      } catch {
        return {
          predictedAmount: 0,
          confidence: "low",
          trend: "stable",
          factors: ["Niewystarczające dane"]
        }
      }
    }
  } catch (error) {
    console.error('Błąd predykcji:', error)
    return null
  }
}
