'use client'

import { create } from 'zustand'

const useCartStore = create(() => ({
  count: 0,
}))

export default useCartStore