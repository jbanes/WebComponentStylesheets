/*
 * Use this template to create your own Web Component that can import CSSS
 * stylesheets! 
 * 
 * Instructions:
 * 
 * 1. Update the class name on line 17 and 60
 * 
 * 2. If you want your tag to have attributes, add them to line 19. Otherwise 
 *    clear the array on line 19.
 *    
 * 3. Insert your rendering code at line 42
 * 
 * 4. Update the tag name on line 60
 */

class WebComponentTemplate extends HTMLElement 
{
    static observedAttributes = ["YOUR", "ATTRIBUTES", "HERE"];

    #shadow;

    constructor() 
    {
        super();
    }

    #attachElements()
    {
        var that = this;
        
        if(!this.childNodes.length) return;
        
        // Pull in STYLE and LINK tags
        this.childNodes.forEach(function(element) {
            if(element.nodeName === "STYLE" || element.nodeName === "LINK")
            {
                that.#shadow.appendChild(element);
            }
        });
            
        // Add your rendering code here
    }

    connectedCallback()
    {
        var that = this;
        var observer = new MutationObserver(function(mutations) {
            that.#attachElements();
         });

        observer.observe(this, {attributes: false, childList: true, characterData: false, subtree: false});

        this.#shadow = this.attachShadow({ mode: "open" });
        
        this.#attachElements(); // Attempt to load in case we've been invoked late
    }
}

customElements.define("YOUR-TAG-NAME", WebComponentTemplate);