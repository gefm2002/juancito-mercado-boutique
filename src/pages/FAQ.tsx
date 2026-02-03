import { useEffect, useState } from 'react'

interface FAQ {
  question: string
  answer: string
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([])

  useEffect(() => {
    loadFAQs()
  }, [])

  async function loadFAQs() {
    try {
      const res = await fetch('/api/public/config')
      const data = await res.json()
      if (data.faqs) setFaqs(data.faqs)
    } catch (error) {
      console.error('Error loading FAQs:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-display mb-8">Preguntas Frecuentes</h1>
      <div className="max-w-3xl space-y-6">
        {faqs.length > 0 ? (
          faqs.map((faq, idx) => (
            <div key={idx} className="card">
              <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
              <p className="text-muted">{faq.answer}</p>
            </div>
          ))
        ) : (
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">¿Hacen envíos?</h3>
            <p className="text-muted">Sí, hacemos envíos en CABA. Consultá las zonas disponibles en el checkout.</p>
          </div>
        )}
      </div>
    </div>
  )
}
