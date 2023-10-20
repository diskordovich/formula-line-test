import { useEffect, useRef, useState } from 'react'
import useFormulaStringStore from './useFormulaStringStore';
import { QueryClient, QueryClientProvider } from 'react-query';
import TagSuggestion from './tagSuggestion';

const assignType = (elem) => {
  if (elem.type === "tag") return "tag";
  if (elem.type === "character") {
    if (isNaN(Number(elem.value))) {
      if (elem.value.match(/[a-z]/i)) return "char"
      else return "oper"
    }
    else return "num"
  }
}

const applyMathOperation = (firstVal, operator, secondVal) => {
  switch(operator){
    case "*":
      return firstVal * Number(secondVal)
    case "+":
      return firstVal + Number(secondVal)
    case "-":
      return firstVal - Number(secondVal)
    case "/":
      return firstVal / Number(secondVal)
    case "^":
      return Math.pow(firstVal, Number(secondVal))
    default:
      return NaN;
  }
}

const calculateTotal = (array, start = 0) => {
  let total = NaN;
  let operator = null;
  
  for (let i = start; i < array.length; i++){
    if(array[i].type === "num" || array[i].type === "tag") {
      if (operator) {
        total = applyMathOperation(total, operator, array[i].value)
        operator = null;
      }
      else if(isNaN(total)) {
        total = Number(array[i].value)
      }
      else return NaN;
    }
    else if(array[i].type === "oper") {
      
      if (array[i].value === ")"){
        return [total, i]
      }
      else if (operator) {
        if (array[i].value === "("){
          const [resultingTotal, newI] = calculateTotal(array, i+1)
          total = applyMathOperation(total, operator, resultingTotal)
          i = newI
          operator = null;
          continue;
        }
        else return NaN;
      }
      else operator = array[i].value

    }
    else return NaN
  }
  return [total, array.length-1];
}

function App() {
  const formulaString = useFormulaStringStore();
  const [inputIndex, setInputIndex] = useState(-1);
  const [objectArray, setObjectArray] = useState([]);
  const [result, setResult] = useState(0);
  const [suggestedPhrase, setSuggestedPhrase] = useState(null);
  const cursorRef = useRef();
  const queryClient = new QueryClient();

  useEffect(() => {
    const newArray = []
    formulaString.string.map((elem, index) => {
      let newElem;
      if (elem.type === "character") newElem = <span key={index} onClick={() => { setInputIndex(index) }}>{elem.value}</span>
      if (elem.type === "tag") newElem = <span className='tag' key={index} onClick={() => { setInputIndex(index) }}>{elem.name}</span>
      newArray.push(newElem)
    })
    if (inputIndex > -1) {
      const getSuggestedPhrase = (index, array) => {
        let phraseBackwards = "";
        for (let i = index; i > -1; i--) {
          if (assignType(array[i]) !== "char") break;
          phraseBackwards += array[i].value
        }
        if (phraseBackwards.length > 0 && newArray.length > 0) setSuggestedPhrase(phraseBackwards.split("").reverse().join(""));
        else setSuggestedPhrase(null);
      }
      getSuggestedPhrase(inputIndex - 1, formulaString.string)
      newArray.splice(inputIndex, 0, <span key="cursor" ref={cursorRef}>|</span>)
    }
    setObjectArray(newArray);
  }, [formulaString.string.length, inputIndex])

  useEffect(() => {
    const newDataArray = []
    formulaString.string.map((elem, index) => {
      const elemType = assignType(elem)
      if (index === 0) {
        newDataArray.push({ ...elem, type: elemType })
      }

      else if (newDataArray[newDataArray.length - 1].type === elemType && elemType !== "tag" && elemType !== "oper") newDataArray[newDataArray.length - 1].value += elem.value
      else newDataArray.push({ ...elem, type: elemType })
    })
    setResult(calculateTotal(newDataArray)[0]);
  }, [formulaString.string.length])

  const onTextInputMain = (e) => {
    if (inputIndex > -1) {
      if (e.key === "ArrowLeft" && inputIndex > 0) {
        setInputIndex(index => index - 1);
      }
      if (e.key === "ArrowRight" && inputIndex < objectArray.length - 1) {
        setInputIndex(index => index + 1);
      }
      if (e.key === "ArrowUp") {
        setInputIndex(0);
      }
      if (e.key === "ArrowDown" && inputIndex != objectArray.length - 1) {
        setInputIndex(objectArray.length - 1);
      }
      if (e.key === "Backspace" && inputIndex > 0) {
        formulaString.removeItem(inputIndex - 1);
        setInputIndex(index => index - 1);
      }
      if (e.key.length === 1) {
        formulaString.addItem({ type: "character", value: e.key }, inputIndex)
        setInputIndex(index => index + 1);
      }
    }

  }
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <div id="wrapper">
          <div className='formulaLine' tabIndex={0} onKeyDown={onTextInputMain}>
            {objectArray}
            <span style={{ width: "100%", height: "100%" }} onClick={() => setInputIndex(formulaString.string.length)}></span>
          </div>
          <div className='result'>Result:{result}</div>
        </div>
        {suggestedPhrase && <TagSuggestion setPhraseString={setSuggestedPhrase} phraseString={suggestedPhrase} cursorRef={cursorRef} cursorIndex={inputIndex} setInputIndex={setInputIndex} />}
      </QueryClientProvider>
    </>
  )
}

export default App
