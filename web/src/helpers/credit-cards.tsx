import type { ComponentProps, JSX } from 'react'
import { CreditCardIcon } from '@/components/icons/credit-card-icon'

export type CreditCardBrand = {
  name: string
  icon: (props: ComponentProps<'div'>) => JSX.Element
  color?: string
  gradient?: string[]
}

export const creditCards: CreditCardBrand[] = [
  {
    name: 'Amazon',
    icon: props => <CreditCardIcon bg="#232F3E" {...props} />,
    color: '#232F3E',
  },
  {
    name: 'Ame Digital',
    icon: props => <CreditCardIcon bg="#F0027F" {...props} />,
    color: '#F0027F',
  },
  {
    name: 'Americanas',
    icon: props => <CreditCardIcon bg="#E60014" {...props} />,
    color: '#E60014',
  },
  {
    name: 'Banco do Brasil',
    icon: props => <CreditCardIcon bg="#FEDD00" {...props} />,
    color: '#FEDD00',
  },
  {
    name: 'Banco Inter',
    icon: props => <CreditCardIcon bg="#FF7A00" {...props} />,
    color: '#FF7A00',
  },
  {
    name: 'Banrisul',
    icon: props => <CreditCardIcon bg="#0B5ED7" {...props} />,
    color: '#0B5ED7',
  },
  {
    name: 'Bradesco',
    icon: props => <CreditCardIcon bg="#CC092F" {...props} />,
    color: '#CC092F',
  },
  {
    name: 'BRB',
    icon: props => <CreditCardIcon bg="#0057A4" {...props} />,
    color: '#0057A4',
  },
  {
    name: 'BTG Pactual',
    icon: props => <CreditCardIcon bg="#1E1E1E" {...props} />,
    color: '#1E1E1E',
  },
  {
    name: 'C&A (Bradescard)',
    icon: props => <CreditCardIcon bg="#000000" {...props} />,
    color: '#000000',
  },
  {
    name: 'C6 Bank',
    icon: props => <CreditCardIcon bg="#000000" {...props} />,
    color: '#000000',
  },
  {
    name: 'Caixa Econômica Federal',
    icon: props => <CreditCardIcon bg="#005CA9" {...props} />,
    color: '#005CA9',
  },
  {
    name: 'Carrefour',
    icon: props => <CreditCardIcon bg="linear-gradient(135deg, #0038A8, #ED1C24)" {...props} />,
    color: '#0038A8',
    gradient: ['#0038A8', '#ED1C24'],
  },
  {
    name: 'Casas Bahia',
    icon: props => <CreditCardIcon bg="#003399" {...props} />,
    color: '#003399',
  },
  {
    name: 'Credicard',
    icon: props => <CreditCardIcon bg="#E50019" {...props} />,
    color: '#E50019',
  },
  {
    name: 'Digio',
    icon: props => <CreditCardIcon bg="linear-gradient(135deg, #061A4C, #0E78B3)" {...props} />,
    color: '#061A4C',
    gradient: ['#061A4C', '#0E78B3'],
  },
  {
    name: 'Itaú',
    icon: props => <CreditCardIcon bg="#EC7000" {...props} />,
    color: '#EC7000',
  },
  {
    name: 'Magalu',
    icon: props => <CreditCardIcon bg="linear-gradient(135deg, #0086FF, #39B5FF)" {...props} />,
    color: '#0086FF',
    gradient: ['#0086FF', '#39B5FF'],
  },
  {
    name: 'Méliuz',
    icon: props => <CreditCardIcon bg="#FF1E61" {...props} />,
    color: '#FF1E61',
  },
  {
    name: 'Mercado Livre',
    icon: props => <CreditCardIcon bg="#FFE600" {...props} />,
    color: '#FFE600',
  },
  {
    name: 'Mercado Pago',
    icon: props => <CreditCardIcon bg="#009EE3" {...props} />,
    color: '#009EE3',
  },
  {
    name: 'Neon',
    icon: props => <CreditCardIcon bg="linear-gradient(135deg, #0099F4, #00E7F1)" {...props} />,
    color: '#0099F4',
    gradient: ['#0099F4', '#00E7F1'],
  },
  {
    name: 'Next',
    icon: props => <CreditCardIcon bg="linear-gradient(135deg, #00FF5F, #00C853)" {...props} />,
    color: '#00FF5F',
    gradient: ['#00FF5F', '#00C853'],
  },
  {
    name: 'Nomad',
    icon: props => <CreditCardIcon bg="#FFFA1E" {...props} />,
    color: '#FFFA1E',
  },
  {
    name: 'Nubank',
    icon: props => <CreditCardIcon bg="linear-gradient(135deg, #820AD1, #5B0EAD)" {...props} />,
    color: '#820AD1',
    gradient: ['#820AD1', '#5B0EAD'],
  },
  {
    name: 'Original',
    icon: props => <CreditCardIcon bg="#00A859" {...props} />,
    color: '#00A859',
  },
  {
    name: 'PAN',
    icon: props => <CreditCardIcon bg="#00AEEF" {...props} />,
    color: '#00AEEF',
  },
  {
    name: 'Pão de Açúcar',
    icon: props => <CreditCardIcon bg="#004A2F" {...props} />,
    color: '#004A2F',
  },
  {
    name: 'PagBank',
    icon: props => <CreditCardIcon bg="#00A859" {...props} />,
    color: '#00A859',
  },
  {
    name: 'PicPay',
    icon: props => <CreditCardIcon bg="#21C25E" {...props} />,
    color: '#21C25E',
  },
  {
    name: 'Renner (Realize)',
    icon: props => <CreditCardIcon bg="#ED1C24" {...props} />,
    color: '#ED1C24',
  },
  {
    name: 'Riachuelo (Midway)',
    icon: props => <CreditCardIcon bg="#000000" {...props} />,
    color: '#000000',
  },
  {
    name: 'Rico',
    icon: props => <CreditCardIcon bg="#FF4B12" {...props} />,
    color: '#FF4B12',
  },
  {
    name: 'Safra',
    icon: props => <CreditCardIcon bg="#002D4B" {...props} />,
    color: '#002D4B',
  },
  {
    name: 'Samsung (Itaú)',
    icon: props => <CreditCardIcon bg="#1428A0" {...props} />,
    color: '#1428A0',
  },
  {
    name: 'Santander',
    icon: props => <CreditCardIcon bg="#EA1D25" {...props} />,
    color: '#EA1D25',
  },
  {
    name: 'Sicoob',
    icon: props => <CreditCardIcon bg="#003641" {...props} />,
    color: '#003641',
  },
  {
    name: 'Sicredi',
    icon: props => <CreditCardIcon bg="#6DBE45" {...props} />,
    color: '#6DBE45',
  },
  {
    name: 'Will Bank',
    icon: props => <CreditCardIcon bg="#FFD400" {...props} />,
    color: '#FFD400',
  },
  {
    name: 'Wise',
    icon: props => <CreditCardIcon bg="#9FE870" {...props} />,
    color: '#9FE870',
  },
  {
    name: 'XP',
    icon: props => <CreditCardIcon bg="#000000" {...props} />,
    color: '#000000',
  },
]
