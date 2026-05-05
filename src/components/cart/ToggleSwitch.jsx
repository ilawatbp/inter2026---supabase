import { useState } from "react"

export default function ToggleSwitch({buttonEnable, setButtonEnable}){


    return(
        <button
            type="button"
            onClick={() => setButtonEnable(!buttonEnable)}
            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-all duration-300 ${buttonEnable ? "outline outline-green-400" : "outline outline-green-400"}`}
        >
            <span className={`inline-block h-3 w-3 rounded-full shadow transform transition-all duration-300 ${buttonEnable ? "translate-x-4 bg-green-200 " : "translate-x-1 bg-white"}`}>

            </span>
        </button>
    )
}