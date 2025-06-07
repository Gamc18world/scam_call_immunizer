import { ScamScenario } from '../types';

export const scamScenarios: ScamScenario[] = [
  {
    id: 'call-1',
    title: 'IRS Tax Scam',
    type: 'call',
    content: 'This is Agent Johnson from the IRS. We\'ve found a discrepancy in your tax return and you owe $5,000 in back taxes. If you don\'t pay immediately, we\'ll issue an arrest warrant.',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_4f47f0b3bb.mp3',
    tips: [
      'Government agencies like the IRS will never call demanding immediate payment',
      'They won\'t threaten immediate arrest',
      'They always provide written notification first',
      'They never require a specific payment method like gift cards'
    ],
    goodResponseKeywords: ['no', 'verify', 'call back', 'written', 'mail', 'official', 'hang up']
  },
  {
    id: 'call-2',
    title: 'Tech Support Scam',
    type: 'call',
    content: 'Hello, I\'m calling from Microsoft Technical Support. Our servers have detected a virus on your computer. We need to fix it immediately before your personal data is compromised.',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/23/audio_a4f4b33e95.mp3',
    tips: [
      'Microsoft doesn\'t make unsolicited calls about computer issues',
      'Tech companies don\'t monitor your personal computer for viruses',
      'Never give remote access to your computer to strangers',
      'Legitimate tech support won\'t pressure you for immediate action'
    ],
    goodResponseKeywords: ['no', 'scam', 'hang up', 'not interested', 'fake']
  },
  {
    id: 'text-1',
    title: 'Bank Alert Scam',
    type: 'text',
    content: 'URGENT: Your bank account has been compromised! Call 123-456-7890 immediately to verify your identity and secure your funds.',
    tips: [
      'Banks never ask you to call an unfamiliar number',
      'They won\'t create a false sense of urgency',
      'Always call the number on the back of your card instead',
      'Legitimate banks don\'t send texts with suspicious links'
    ],
    goodResponseKeywords: ['card', 'official', 'website', 'app', 'ignore', 'delete', 'report']
  },
  {
    id: 'text-2',
    title: 'Package Delivery Scam',
    type: 'text',
    content: 'Your package delivery was attempted but failed due to an incorrect address. Click here to reschedule: http://amzn-delivery.co/reschedule',
    tips: [
      'Legitimate delivery services specify which package or order number',
      'Check the sender\'s email/phone number for authenticity',
      'Never click suspicious links - go directly to the official website',
      'Be wary of urgency or threats about your package'
    ],
    goodResponseKeywords: ['ignore', 'official', 'app', 'website', 'tracking', 'delete']
  }
];