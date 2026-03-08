
import React, { useState } from 'react';
import { Header } from '../components/Header';

import { Cart } from '../components/Cart';
import { Footer } from '../components/Footer';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can use this number on our website or the carrier's website to track your package."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for unworn items with original tags. Items must be in original condition for a full refund."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 5-7 business days, express shipping takes 2-3 business days, and overnight shipping delivers the next business day."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to the US, Canada, UK, EU, and Australia. For other locations, we offer special orders through WhatsApp."
    },
    {
      question: "How do I change or cancel my order?",
      answer: "Orders can be modified or cancelled within 2 hours of placement. After that, please contact customer service as soon as possible."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and bank transfers."
    },
    {
      question: "How do I find my size?",
      answer: "Check our size guide on each product page. Measurements are provided for accurate fitting. Contact customer service if you need help choosing."
    },
    {
      question: "Can I get a refund if items don't fit?",
      answer: "Yes, we offer full refunds for items that don't fit, as long as they're returned within 30 days in original condition."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <SecondaryNavbar />
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions or contact our support team for personalized assistance.
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <HelpCircle className="mr-3 text-purple-600" size={24} />
            Frequently Asked Questions
          </h2>
          
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg">
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="text-purple-600" size={20} />
                ) : (
                  <ChevronDown className="text-gray-400" size={20} />
                )}
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-purple-50 p-8 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-4">Still need help?</h3>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our customer service team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              Contact Support
            </button>
            <button className="bg-white text-purple-600 border border-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors">
              Live Chat
            </button>
          </div>
        </div>
      </div>
      <Cart />
      <Footer />
    </div>
  );
};

export default Help;
