'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface FAQItem {
  question: string
  answer: string
  cta?: { href: string; label: string }
}

export interface FAQGroup {
  title: string
  items: FAQItem[]
}

export interface FAQSection {
  title: string
  groups: FAQGroup[]
}

interface FAQAccordionProps {
  items: FAQItem[]
  idPrefix?: string
}

export function FAQAccordion({ items, idPrefix = 'faq' }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="divide-y divide-gray-100">
      {items.map((faq, index) => {
        const isOpen = openIndex === index
        const panelId = `${idPrefix}-panel-${index}`
        const buttonId = `${idPrefix}-button-${index}`
        return (
          <div key={faq.question} className="py-4">
            <button
              id={buttonId}
              onClick={() => toggle(index)}
              className="flex w-full min-h-[44px] items-center justify-between text-left"
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span className="text-[15px] font-medium text-brand">{faq.question}</span>
              <motion.svg
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                className="ml-3 h-5 w-5 shrink-0 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pt-2 pb-1 text-[14px] leading-relaxed text-gray-500 whitespace-pre-line">
                    {faq.answer}
                  </p>
                  {faq.cta && (
                    <Link
                      href={faq.cta.href}
                      {...(faq.cta.href.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="mt-3 inline-flex min-h-[44px] items-center border border-brand px-4 py-2 text-[13px] font-medium text-brand transition-colors hover:bg-brand hover:text-white"
                    >
                      {faq.cta.label}
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

interface FAQSectionsProps {
  sections: FAQSection[]
}

export function FAQSections({ sections }: FAQSectionsProps) {
  return (
    <div className="space-y-14 md:space-y-16">
      {sections.map((section, sectionIndex) => (
        <div key={section.title}>
          <h3 className="font-serif text-[1.35rem] font-extralight tracking-[-0.02em] text-brand md:text-[1.5rem]">
            {section.title}
          </h3>
          <div className="mt-8 space-y-10">
            {section.groups.map((group, groupIndex) => (
              <div key={group.title}>
                <p className="text-eyebrow text-gray-500">{group.title}</p>
                <div className="mt-4 border-t border-gray-200">
                  <FAQAccordion
                    items={group.items}
                    idPrefix={`faq-${sectionIndex}-${groupIndex}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
