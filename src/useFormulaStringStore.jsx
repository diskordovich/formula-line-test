import { create } from 'zustand'
const useFormulaStringStore = create((set) => ({
    string: [],
    addItem: (item, index) => {
      set((state) => {
        if (state.string.length === 0) {
          return {string:[item]}
        }
        const stringCopy = state.string;
        stringCopy.splice(index, 0, item)
        return {string:stringCopy}
      })
    },
    removeItem: (index, amount = 1)=>{
      set((state)=>{
        const stringCopy = state.string;
        stringCopy.splice(index, amount)
        return {string:stringCopy}
      })
    },
    replaceItem: (index, item, amount = 1)=>{
      set((state)=>{
        const stringCopy = state.string;
        stringCopy.splice(index, amount, item)
        return {string:stringCopy}
      })
    }
  }))
export default useFormulaStringStore;