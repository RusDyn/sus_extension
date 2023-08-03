import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"
import { callLLM } from "./core/call-llm";

const storage = new Storage()

const handleProfilePage = async () => {

    const base = document.querySelector(".top-container > div > div > div > div:nth-child(2) > div:nth-child(4)");





    if (base.getAttribute("data-sus") === "true") {
        return;
    }

    base.setAttribute("data-sus", "true")

    console.log(base);
    console.log(base.textContent);
    const contenxt = base.textContent;

    await storage.set("sus-info", contenxt);
    await storage.remove("sus-info-summary");


    const panel = document.querySelector(".top-container > div > div > div:nth-child(2)");

    const div = document.createElement("div");
    // create input and save button for open ai key
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    const currentKey = await storage.get("openai-key");

    const placeholderMessage = !currentKey ? "Set OpenAI key" : "Update OpenAI key";
    input.setAttribute("placeholder", placeholderMessage);
    input.setAttribute("style", "width: 300px; margin-right: 10px;");
    const button = document.createElement("button");
    button.innerHTML = "Save";
    button.setAttribute("style", "width: 100px; margin-right: 10px;");
    button.addEventListener("click", async () => {
        const key = input.value;

        await storage.set("openai-key", key);
        // show success message
        const b = document.createElement("div");
        b.innerHTML = key ? "OpenAI key saved." : "OpenAI key removed.";
        button.parentElement.appendChild(b);
        setTimeout(() => {
            button.parentElement.removeChild(b);
        }, 3000);
    });

    div.appendChild(input);
    div.appendChild(button);

    const b = document.createElement("h5");
    b.innerHTML = "Profile info saved. You can now go back to <a href='https://www.startupschool.org/cofounder-matching/candidate/next'>cofounder matching page</a>.";

    const msg = document.createElement("p");

    msg.innerHTML = `To get your OpenAI key, go to <a href='https://platform.openai.com/account/api-keys'>OpenAI API Keys</a> and create a new key.`
    msg.innerHTML += `<br />You key is not sent to any server. It is stored in your browser's local storage.`
    div.appendChild(msg);


    panel.appendChild(div);
    panel.appendChild(b);
}

const addButtonsToSUS = async () => {

    const base = document.querySelector(".top-container > div > div > div");
    if (!base) {
        return;
    }

    const mainForm = base.querySelector(":scope > div:first-child > div:nth-child(2)");

    if (!mainForm) {
        return;
    }

    if (mainForm.querySelector("img").getAttribute('data-sus') === "true") {
        return;
    }
    mainForm.querySelector("img").setAttribute('data-sus', "true");

    //mainForm.innerHTML = "Loading...";
    const prevInfo = mainForm.querySelector('.sus-info-item');
    if (prevInfo) {
        prevInfo.parentElement.removeChild(prevInfo);
    }
    const others1 = mainForm.querySelectorAll(":scope > div:not(:first-child)");
    const loadingNode = document.createElement("div");
    loadingNode.setAttribute('class', 'sus-info-item');
    loadingNode.innerHTML = "AI, the universe's slowest quick thinker, is currently crunching the numbers and calculating the best response. Please hold on, your answer is being crafted... Loading...";
    //mainForm.appendChild(loadingNode)
    mainForm.insertBefore(loadingNode, mainForm.childNodes[1]);

    const others = base.querySelectorAll(":scope > div:nth-child(2) > div:not(:first-child)");

    const name = mainForm.querySelector('h1').textContent;
    let text = `${name}`
    others1.forEach((node) => {
        text += node.textContent;

    })

    const toHideElements = [...others1, ...others]
    for (let i = 0; i < toHideElements.length; i++) {
        //toHideElements[i].setAttribute("style", "display: none;");
    }

    let openAIKey = await storage.get("openai-key");
    if (!openAIKey) {
        loadingNode.innerHTML = "OPENAI KEY not found. Please go to your <a href='https://www.startupschool.org/cofounder-matching/profile'>profile page</a> first.";
        return;
    }

    let summary = await storage.get("sus-info-summary");
    if (!summary) {
        let info = await storage.get("sus-info");
        if (!info) {
            loadingNode.innerHTML = "Profile info not found. Please go to your <a href='https://www.startupschool.org/cofounder-matching/profile'>profile page</a> first.";
            return;
        }


        const text = info as string;
        const result = await callLLM(openAIKey, "summary", {
            summary: text
        });
        console.log(result)
        summary = result;
        await storage.set("sus-info-summary", result);

    }

    const result = await callLLM(openAIKey, "match", {
        about: summary,
        summary: text
    });

    const json = JSON.parse(result);
    const { skills, background, request, match, value, message } = json;

    const toBulletItem = (label, items) => {
        return `<div><b>${label}</b><br />
        <ul>
        ${items.map((b: string) => `<li>${b}</li>`).join('')}
        </ul></div>`
    }
    const toDivItem = (label, items) => {
        return `<div><b>${label}</b><br />
        <div style='display: flex; flex-wrap: wrap;'>
        ${items.map((b: string) => `<div style='background: antiquewhite;
        padding: 3px 10px;
        margin-left: 5px;'>${b}</div>`).join('')}
        </div></div>`
    }
    const resultHtml = `
    <div style='background-color: white; border: 1px solid rgb(192, 192, 192); border-radius: 4px; width: 100%; margin-bottom: 25px; padding: 28px;'>
        <h1>Score: ${value}/100</h1>
        ${toDivItem("Skills", skills)}
        ${toBulletItem("Background", background)}
        ${toBulletItem("Looking for:", request)}
        ${toBulletItem("Match", match)}
        
    </div > `
    loadingNode.innerHTML = resultHtml;

    const input = base.querySelector(":scope > div:nth-child(2) > div:first-child textarea");
    const textarea = input as HTMLTextAreaElement;
    textarea.value = message;
    textarea.setAttribute('rows', '5')
    textarea.removeAttribute('style')
    //addGenerateMessageButton(textarea, result);
}
// create mutation oberver to detect new nodes
// add custom button
function createObserver() {
    console.log('createObserver')

    let callback: () => void = undefined;
    const host = window.location.host;
    const href = window.location.href;

    if (host === "www.startupschool.org") {

        if (href.startsWith("https://www.startupschool.org/cofounder-matching/profile")) {
            callback = handleProfilePage;
        }
        else if (href.startsWith("https://www.startupschool.org/cofounder-matching")) {
            callback = addButtonsToSUS;
        }
        if (callback) {
            var obs = new MutationObserver(function (mutations, me) {
                callback();
            })
            callback();
            return obs
        }
        else {
            console.log(`No callback for host ${host}`)
        }
    }
}
export const config: PlasmoCSConfig = {
    matches: ["https://www.startupschool.org/*"],
}

var observerConfig = {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
};


window.addEventListener("load", () => {
    const obs = createObserver();
    if (obs) {
        obs.observe(window.document.body, observerConfig);
    }
})


const CustomContent = () => {
    return <></>


}

export default CustomContent