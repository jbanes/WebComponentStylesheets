class MyButton extends HTMLElement 
{
    static observedAttributes = ["text"];

    constructor() 
    {
        super();
    }

    connectedCallback()
    {
        var shadow = this.attachShadow({ mode: "open" });
        var button = document.createElement("button");

        button.classList.add("thicc");
        button.textContent = this.attributes.item("text").nodeValue;

        shadow.appendChild(button);
    }
}

customElements.define("my-button", MyButton);