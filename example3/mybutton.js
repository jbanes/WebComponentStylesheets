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

        this.childNodes.forEach(function(element) {
            if(element.nodeName === "STYLE")
            {
                shadow.appendChild(element);
            }
        });

        button.classList.add("thicc");
        button.textContent = this.attributes.item("text").nodeValue;

        shadow.appendChild(button);
    }
}

customElements.define("my-button", MyButton);