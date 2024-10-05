class CodeHighlight extends HTMLElement 
{
    static observedAttributes = [];
    
    static TYPE_SPACE = 0;
    static TYPE_WORD = 1;
    static TYPE_SEPARATORS = 2;
    static TYPE_STRING = 3;
    static TYPE_COMMENT_SINGLE = 4;
    static TYPE_COMMENT_MULTI = 5;
    
    static keywords = ["for", "if", "while", "else", "function", "break", "continue", "return", "var", "let", "const", "this", "get", "set"];
    static global = ["$", "console", "window"];

    #shadow;
    #code;

    constructor() 
    {
        super();
    }
    
    #renderCode()
    {
        var that = this;
        var code = document.createElement("code");
        
        if(!this.childNodes.length) return;
        
        this.childNodes.forEach(function(element) {
            if(element.nodeName === "STYLE" || element.nodeName === "LINK")
            {
                that.#shadow.appendChild(element);
            }
            
            if(element.nodeName === "CODE")
            {
                that.#code = element.textContent;
                that.removeChild(element);
            }
        });
        
        if(!this.#code) return;
        
        code.textContent = this.#code;
        
        this.#shadow.appendChild(code);
    }
    
    connectedCallback()
    {
        var that = this;
        
        this.#shadow = this.attachShadow({ mode: "open" });

        var observer = new MutationObserver(function() {
            that.#renderCode();
         });

        observer.observe(this, {attributes: false, childList: true, characterData: false, subtree: false});

        this.#renderCode();
    }
}

customElements.define("code-highlight", CodeHighlight);