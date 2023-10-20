import { useEffect, useState } from "react"
import useFormulaStringStore from "./useFormulaStringStore";
import { useQuery, useQueryClient } from "react-query";

const TagSuggestionTab = ({ phraseString, cursorRef, cursorIndex, setInputIndex, setPhraseString }) => {
    const formulaString = useFormulaStringStore()
    const [tagArray, setTagArray] = useState([]);
    const [posCoords, setPosCoords] = useState({ top: 0, left: 0 })
    const result = useQuery('tags', async () => {
        const result = await fetch('https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete').then((res) => res.json())
        return result
    })

    useEffect(() => {
        if (result.status !== "loading") {
            const allTags = result.data;
            const filteredTags = [];
            allTags.map((elem, index) => {
                if (elem.name.includes(phraseString)) filteredTags.push(<button key={index} onClick={() => {
                    formulaString.replaceItem(cursorIndex - phraseString.length, { type: "tag", name: elem.name, value: elem.value }, phraseString.length);
                    setInputIndex(-1)
                    setPhraseString(null)
                }}>{elem.name}</button>);
            })
            setTagArray(filteredTags)
        }
    }, [phraseString, result.status])

    useEffect(() => {
        const pos = cursorRef.current.getBoundingClientRect();
        setPosCoords({ top: pos.top + 30, left: pos.left })
    }, [phraseString])

    return (
        <div style={{ position: "absolute", top: posCoords.top, left: posCoords.left, display: "flex", flexDirection: "column", maxHeight: "300px", overflow: "scroll" }}>
            {tagArray}
        </div>
    )
}

export default TagSuggestionTab