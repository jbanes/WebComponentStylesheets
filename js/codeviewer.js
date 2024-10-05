class CodeViewer extends HTMLElement 
{
    static observedAttributes = [];

    #shadow;
    #style;
    #files;

    constructor() 
    {
        super();
    }
    
    #renderFiles()
    {
        var that = this;
        var index = 1;
        var root = this.#files.getAttribute("root");
        var render = this.#files.getAttribute("render");

        var codeui = document.createElement("div");
        var tabbedui = document.createElement("div");
        var frame = document.createElement("div");
        
        var tabs = document.createElement("div");
        var tabcontent = document.createElement("div");
        
        var frametabs = document.createElement("div");
        var resulttab = document.createElement("div");
        var resultcontent = document.createElement("div");
        var resultbutton = document.createElement("div");
        
        var iframe = document.createElement("iframe");
        var open = document.createElement("button");
        
        codeui.classList.add("codeui");
        tabbedui.classList.add("tabbedui");
        frame.classList.add("frame");
        
        tabs.classList.add("tabs");
        tabs.setAttribute("role", "tablist");
        tabcontent.classList.add("tabcontent");
        
        frametabs.classList.add("tabs");
        frametabs.setAttribute("role", "tablist");
        resulttab.setAttribute("id", "result-tab");
        resulttab.setAttribute("role", "tab");
        resulttab.setAttribute("aria-controls", "result-content");
        resulttab.setAttribute("aria-selected", "true");
        resulttab.innerText = "View";
        
        resultcontent.classList.add("iframe");
        iframe.setAttribute("src", root + "/" + render);
        
        open.textContent = "Open";
        open.onclick = function() {
            window.open(root + "/" + render, "_blank");
        };
        
        this.#files.childNodes.forEach(function(element) {

            if(element.nodeName !== "FILE") return;
        
            var tab = document.createElement("div");
            var content = document.createElement("div");
            
            tab.setAttribute("id", "tab" + index);
            tab.setAttribute("role", "tab");
            tab.setAttribute("aria-controls", "tabcontent" + index);
            tab.textContent = element.textContent;
            
            content.setAttribute("id", "tabcontent" + index);
            content.setAttribute("role", "tabpanel");
            content.setAttribute("aria-labelledby", "tab" + index);
            
            if(index === 1) 
            {
                tab.setAttribute("aria-selected", "true");
                content.setAttribute("aria-selected", "true");
            }
            
            tabs.appendChild(tab);
            tabcontent.appendChild(content);
            
            (async function() {
                var response = await fetch(root + "/" + element.textContent);
                var text = await response.text();
                
                var highlight = document.createElement("code-highlight");
                var code = document.createElement("code");
                
                code.textContent = text;
                highlight.appendChild(that.#style.cloneNode());
                highlight.appendChild(code);
                content.appendChild(highlight);
            })();
            
            tab.onclick = function() {
                tabs.childNodes.forEach(function(element) {
                    element.removeAttribute("aria-selected");
                });
                
                tabcontent.childNodes.forEach(function(element) {
                    element.removeAttribute("aria-selected");
                });
                
                tab.setAttribute("aria-selected", "true");
                content.setAttribute("aria-selected", "true");
            };
            
            index++;
        });
        
        tabbedui.appendChild(tabs);
        tabbedui.appendChild(tabcontent);
        
        frametabs.appendChild(resulttab);
        resultcontent.appendChild(iframe);
        resultbutton.append(open);
        
        frame.appendChild(frametabs);
        frame.appendChild(resultcontent);
        frame.appendChild(resultbutton);
        
        codeui.appendChild(tabbedui);
        codeui.appendChild(frame);
        
        this.#shadow.appendChild(codeui);
    }
    
    #renderUI()
    {
        var that = this;
        
        if(!this.childNodes.length) return;
        
        this.childNodes.forEach(function(element) {
            if(element.nodeName === "STYLE" || element.nodeName === "LINK")
            {
                that.#style = element;
                that.#shadow.appendChild(element);
            }
            
            if(element.nodeName === "FILES")
            {
                that.#files = element;
                that.removeChild(element);
                that.#renderFiles();
            }
        });
    }
    
    connectedCallback()
    {
        var that = this;
        
        this.#shadow = this.attachShadow({ mode: "open" });

        var observer = new MutationObserver(function() {
            that.#renderUI();
         });

        observer.observe(this, {attributes: false, childList: true, characterData: false, subtree: false});

        this.#renderUI();
    }
}


customElements.define("code-viewer", CodeViewer);
