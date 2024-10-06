class MyButton extends HTMLElement 
{
    static observedAttributes = ["text"];

    #shadow;
    #button;

    constructor() 
    {
        super();
    }

    #attachElements()
    {
        var mybutton = this;

        if(this.attributes.length) 
        {
            this.#button.textContent = this.attributes.item("text").nodeValue;
        }

        if(this.childNodes.length)
        {
            this.childNodes.forEach(function(element) {
                if(element.nodeName === "STYLE" || element.nodeName === "LINK")
                {
                    mybutton.#shadow.appendChild(element);
                }
            });
        }
    }

    connectedCallback()
    {
        var shadow = this.attachShadow({ mode: "open" });
        var button = document.createElement("button");
        var mybutton = this;

        var observer = new MutationObserver(function(mutations) {
            mybutton.#attachElements();
         });

        observer.observe(this, {attributes: false, childList: true, characterData: false, subtree: false});

        button.classList.add("thicc");

        this.#button = button;
        this.#shadow = shadow;

        this.#attachElements();
        shadow.appendChild(button);
    }
}

customElements.define("my-button", MyButton);