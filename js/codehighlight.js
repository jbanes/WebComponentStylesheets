class CodeHighlight extends HTMLElement 
{
    static observedAttributes = ["type", "start"];
    
    static TYPE_SPACE = 0;
    static TYPE_WORD = 1;
    static TYPE_SEPARATORS = 2;
    static TYPE_STRING = 3;
    static TYPE_COMMENT_SINGLE = 4;
    static TYPE_COMMENT_MULTI = 5;
    static TYPE_CSS_SELECTOR = 6;
    static TYPE_CSS_IDENTIFIER = 7;
    static TYPE_TAG = 8;
    static TYPE_ATTRIBUTE = 9;
    
    static keywords = ["for", "if", "while", "else", "function", "break", "continue", "return", "var", "let", "const", "this", "get", "set", "class", "extends", "static", "true", "false"];
    static global = ["$", "console", "window"];

    #shadow;
    #code;
    #tokens;
    #type = "text";
    #startLine = 1;
    
    #inner = false;
    #value = false;
    #media = false;
    #tag = false;
    #attribute = false;
    #style = false;

    constructor() 
    {
        super();
    }
    
    attributeChangedCallback(name, oldValue, newValue)
    {
        if(name === "type") this.#type = newValue.toLowerCase();
        if(name === "start") this.#startLine = parseInt(newValue);
    }
    
    #colorizeHTML(tokens)
    {
        var innerStyle = false;
        
        tokens.forEach(function(line, index) {
            line.forEach(function(token) {
                
                var lower = token.text.toLowerCase();
                
                if(lower.startsWith("</style")) innerStyle = false;
                
                if(innerStyle)
                {
                    token.highlight = "innerstyle";
                }
                
                if(token.type === CodeHighlight.TYPE_TAG) 
                {
                    token.style = "tag";
                }
                
                if(token.type === CodeHighlight.TYPE_ATTRIBUTE) 
                {
                    token.style = "attribute";
                }
                
                if(token.type === CodeHighlight.TYPE_STRING) 
                {
                    token.style = "string";
                }
                
                if(token.type === CodeHighlight.TYPE_COMMENT_MULTI)
                {
                    token.style = "comment";
                }
                
                if(token.type === CodeHighlight.TYPE_CSS_SELECTOR)
                {
                    token.style = "selector";
                }
                
                if(token.type === CodeHighlight.TYPE_CSS_IDENTIFIER)
                {
                    token.style = "identifier";
                }
                
                if(CodeHighlight.TYPE_CSS_SELECTOR && token.text.startsWith('@'))
                {
                    token.style = "function";
                }
                
                if(CodeHighlight.TYPE_CSS_SELECTOR && (token.text === "screen" || token.text === "print"))
                {
                    token.style = "media";
                }
                
                if(lower.startsWith("<style")) innerStyle = true;
            });
        });
        
        return tokens;
    }
    
    #colorizeCSS(tokens)
    {
        tokens.forEach(function(line, index) {
            line.forEach(function(token) {
                if(token.type === CodeHighlight.TYPE_STRING) 
                {
                    token.style = "string";
                }
                
                if(token.type === CodeHighlight.TYPE_COMMENT_SINGLE)
                {
                    token.style = "comment";
                }
                
                if(token.type === CodeHighlight.TYPE_CSS_SELECTOR)
                {
                    token.style = "selector";
                }
                
                if(token.type === CodeHighlight.TYPE_CSS_IDENTIFIER)
                {
                    token.style = "identifier";
                }
                
                if(token.text.startsWith('@'))
                {
                    token.style = "function";
                }
                
                if(token.text === "screen" || token.text === "print")
                {
                    token.style = "media";
                }
            });
        });
        
        return tokens;
    }
    
    #colorizeJavascript(tokens)
    {
        var bold = false;

        tokens.forEach(function(line, index) {
            line.forEach(function(token) {
                if(token.type === CodeHighlight.TYPE_STRING) 
                {
                    token.style = "string";
                }
                
                if(token.type === CodeHighlight.TYPE_WORD)
                {
                    if(bold)
                    {
                        token.style = "function";
                        bold = false;
                    }

                    if(CodeHighlight.keywords.indexOf(token.text) >= 0)
                    {
                        token.style = "keyword";
                        
                        if(token.text === "function" || token.text === "get" || token.text === "set") 
                        {
                            bold = true;
                        }
                    }
                    
                    if(CodeHighlight.global.indexOf(token.text) >= 0)
                    {
                        token.style = "global";
                    }
                }
                
                if(token.type === CodeHighlight.TYPE_SEPARATORS)
                {
                    if(bold) bold = false;
                }
                
                if(token.type === CodeHighlight.TYPE_COMMENT_SINGLE)
                {
                    token.style = "comment";
                }
            });
        });
        
        return tokens;
    }
    
    #parseLineHTML(line)
    {
        let tokens = [];
        let working = "";
        let mode = CodeHighlight.TYPE_SPACE;
        
        let type;
        let open;
        let c;
        
        for(let i=0; i<line.length; i++)
        {
            c = line.charAt(i);
            
            if(mode === CodeHighlight.TYPE_STRING)
            {
                if(c === '\\')
                {
                    working += c + line.charAt(++i);
                    continue;
                }
                
                if(c === open)
                {
                    tokens.push({text: (working + c), type: mode});
                    
                    working = "";
                    mode = CodeHighlight.TYPE_SPACE;
                    continue;
                }
                
                working += c;
                continue;
            }
            
            if(mode === CodeHighlight.TYPE_COMMENT_SINGLE)
            {   
                working += c;
                continue;
            }
            
            if(c === '<') this.#tag = true;
            if(c === '>') this.#tag = this.#attribute = false;
            if(" \t".indexOf(c) >=0 && this.#tag) this.#attribute = true;
            
            if(" \t".indexOf(c) >= 0) type = CodeHighlight.TYPE_SPACE;
            else if(c === '<') type = CodeHighlight.TYPE_TAG;
            else if(c === '>') type = CodeHighlight.TYPE_TAG;
            else if(this.#attribute && "\"'".indexOf(c) >= 0) type = CodeHighlight.TYPE_STRING;
            else if(this.#attribute && "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_=-".indexOf(c) >= 0) type = CodeHighlight.TYPE_ATTRIBUTE;
            else if(this.#tag && "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!/-".indexOf(c) >= 0) type = CodeHighlight.TYPE_TAG;
            else if(!this.#tag) type = CodeHighlight.TYPE_WORD;
//            else if("/".indexOf(c) >= 0 && line.charAt(i+1) === '/') type = CodeHighlight.TYPE_COMMENT_SINGLE;
//            else if("/".indexOf(c) >= 0 && line.charAt(i+1) === '*') type = CodeHighlight.TYPE_COMMENT_MULTI;
            else throw new Error("Unrecognized character [" + c + "]");
            
            if(type === mode)
            {
                working += c;
                continue;
            }
            
            if(working)
            {
                tokens.push({text: working, type: mode});

                if(working.toLowerCase().startsWith("<style")) this.#style = true;

                working = "";
            }
            
            if(type === CodeHighlight.TYPE_STRING)
            {
                open = c;
            }
            
            working = c;
            mode = type;
        }
         
        if(working)
        {
            tokens.push({text: working, type: mode});
            
            if(working.toLowerCase().startsWith("<style")) this.#style = true;
        }
        
        return tokens;
    }
    
    #parseLineCSS(line)
    {
        let tokens = [];
        let working = "";
        let mode = CodeHighlight.TYPE_SPACE;
        
        let type;
        let open;
        let c;
        
        for(let i=0; i<line.length; i++)
        {
            c = line.charAt(i);
            
            if(mode === CodeHighlight.TYPE_STRING)
            {
                if(c === '\\')
                {
                    working += c + line.charAt(++i);
                    continue;
                }
                
                if(c === open)
                {
                    tokens.push({text: (working + c), type: mode});
                    
                    working = "";
                    mode = CodeHighlight.TYPE_SPACE;
                    continue;
                }
                
                working += c;
                continue;
            }
            
            if(mode === CodeHighlight.TYPE_COMMENT_SINGLE)
            {   
                working += c;
                continue;
            }
            
            if(this.#inner && c === ':') this.#value = true;
            if(this.#inner && c === ';') this.#value = false;

            if(c === '@') this.#media = true;
            if(c === '{' && !this.#media) this.#inner = true;
            if(c === '}' && !this.#media) this.#inner = this.#value = false;
            if(c === '{' && this.#media) this.#media = false;
            if(c === '(' && this.#media) this.#inner = true;
            if(c === ')' && this.#media) this.#inner = this.#value = false;
            
            if(" \t".indexOf(c) >= 0) type = CodeHighlight.TYPE_SPACE;
            else if("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$#-@.".indexOf(c) >= 0) type = this.#inner ? (this.#value ? CodeHighlight.TYPE_WORD : CodeHighlight.TYPE_CSS_IDENTIFIER) : (this.#media ? CodeHighlight.TYPE_WORD : CodeHighlight.TYPE_CSS_SELECTOR);
            else if("[]{}()=+\*|!%?;,:<>&".indexOf(c) >= 0) type = CodeHighlight.TYPE_SEPARATORS;
            else if("\"'`".indexOf(c) >= 0) type = CodeHighlight.TYPE_STRING;
            else if("/".indexOf(c) >= 0 && line.charAt(i+1) === '/') type = CodeHighlight.TYPE_COMMENT_SINGLE;
            else if("/".indexOf(c) >= 0 && line.charAt(i+1) === '*') type = CodeHighlight.TYPE_COMMENT_MULTI;
            else throw new Error("Unrecognized character [" + c + "]");
            
            if(type === mode)
            {
                working += c;
                continue;
            }
            
            if(working)
            {
                tokens.push({text: working, type: mode});

                working = "";
            }
            
            if(type === CodeHighlight.TYPE_STRING)
            {
                open = c;
            }
            
            working = c;
            mode = type;
        }
         
        if(working)
        {
            tokens.push({text: working, type: mode});
        }
        
        return tokens;
    }
    
    #parseLineJavascript(line)
    {
        let tokens = [];
        let working = "";
        let mode = CodeHighlight.TYPE_SPACE;
        
        let type;
        let open;
        let c;
        
        for(let i=0; i<line.length; i++)
        {
            c = line.charAt(i);
            
            if(mode === CodeHighlight.TYPE_STRING)
            {
                if(c === '\\')
                {
                    working += c + line.charAt(++i);
                    continue;
                }
                
                if(c === open)
                {
                    tokens.push({text: (working + c), type: mode});
                    
                    working = "";
                    mode = CodeHighlight.TYPE_SPACE;
                    continue;
                }
                
                working += c;
                continue;
            }
            
            if(mode === CodeHighlight.TYPE_COMMENT_SINGLE)
            {   
                working += c;
                continue;
            }
            
            if(" \t".indexOf(c) >= 0) type = CodeHighlight.TYPE_SPACE;
            else if("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$#".indexOf(c) >= 0) type = CodeHighlight.TYPE_WORD;
            else if("[]{}()=+-\*|!%?;,.:<>&".indexOf(c) >= 0) type = CodeHighlight.TYPE_SEPARATORS;
            else if("\"'`".indexOf(c) >= 0) type = CodeHighlight.TYPE_STRING;
            else if("/".indexOf(c) >= 0 && line.charAt(i+1) === '/') type = CodeHighlight.TYPE_COMMENT_SINGLE;
            else if("/".indexOf(c) >= 0 && line.charAt(i+1) === '*') type = CodeHighlight.TYPE_COMMENT_MULTI;
            else throw new Error("Unrecognized character [" + c + "]");
            
            if(type === mode)
            {
                working += c;
                continue;
            }
            
            if(working)
            {
                tokens.push({text: working, type: mode});

                working = "";
            }
            
            if(type === CodeHighlight.TYPE_STRING)
            {
                open = c;
            }
            
            working = c;
            mode = type;
        }
         
        if(working)
        {
            tokens.push({text: working, type: mode});
        }
        
        return tokens;
    }
    
    #parseTokensHTML(code)
    {
        let tokens = [];
        let lines = code.split('\n');
        let line;
        let endStyle;

        for(let i=0; i<lines.length; i++)
        {
            endStyle = (lines[i].toLowerCase().indexOf("</style") >= 0);
            
            if(endStyle) this.#style = false;

            if(this.#style) line = this.#parseLineCSS(lines[i]);
            else line = this.#parseLineHTML(lines[i]);
            
            tokens.push(line);
        }

        return tokens;
    }
    
    #parseTokensCSS(code)
    {
        let tokens = [];
        let lines = code.split('\n');
        let line;

        for(let i=0; i<lines.length; i++)
        {
            line = this.#parseLineCSS(lines[i]);
            
            tokens.push(line);
        }

        return tokens;
    }
    
    #parseTokensJavascript(code)
    {
        let tokens = [];
        let lines = code.split('\n');
        let line;

        for(let i=0; i<lines.length; i++)
        {
            line = this.#parseLineJavascript(lines[i]);
            
            tokens.push(line);
        }

        return tokens;
    }
    
    #parseTokensText(code)
    {
        let tokens = [];
        let lines = code.split('\n');
        let line;

        for(let i=0; i<lines.length; i++)
        {
            line = [{text: lines[i], type: CodeHighlight.TYPE_WORD}];
            
            tokens.push(line);
        }

        return tokens;
    }
    
    #addSpacers(element)
    {
        var spacer1 = document.createElement("div");
        var spacer2 = document.createElement("div");
        
        spacer1.classList.add("linenumbers", "halfheight");
        spacer2.classList.add("code", "halfheight");
        
        element.appendChild(spacer1);
        element.appendChild(spacer2);
    }
    
    #renderLines(element, tokens, startLine)
    {
        var lastHighight;
        
        element.replaceChildren(); // Empty out anything already there
        this.#addSpacers(element);
        
        tokens.forEach(function(line, index) {
            var lineHighlight = true;
            var number = document.createElement("div");
            var code = document.createElement("div");
            var span;
            
            number.textContent = index+startLine;
            number.classList.add("linenumbers");
            code.classList.add("code");
            
            if(!line.length || (line.length === 1 && !line[0].text))
            {
                span = document.createElement("span");
                span.innerHTML = "&nbsp;";
                
                if(lastHighight) code.classList.add(lastHighight);
                
                code.appendChild(span);
                element.appendChild(number);
                element.appendChild(code);
                
                return;
            }
            
            line.forEach(function(token) {
                var span = document.createElement("span");
                
                if(token.style) span.classList.add(token.style);
                if(token.highlight) span.classList.add(token.highlight);
                
                if(!token.highlight) lineHighlight = false;
                else if(lineHighlight) lineHighlight = token.highlight;
                
                span.textContent = token.text;
                code.appendChild(span);
            });
            
            if(lineHighlight) code.classList.add(lineHighlight);

            element.appendChild(number);
            element.appendChild(code);
            
            lastHighight = lineHighlight;
        });
        
        this.#addSpacers(element);
    }
    
    #renderCode()
    {
        var that = this;
        var code = document.createElement("code");
        var existing = this.#shadow.querySelector("code");
        
        if(!this.childNodes.length) return;
        if(existing) this.#shadow.removeChild(existing);
        
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
        
        code.classList.add("codeblock");
        
        if(this.#type === "js" || this.#type === "javascript")
        {
            this.#tokens = this.#parseTokensJavascript(this.#code);
            this.#tokens = this.#colorizeJavascript(this.#tokens);
            
            this.#renderLines(code, this.#tokens, this.#startLine);
        }
        else if(this.#type === "css")
        {
            this.#tokens = this.#parseTokensCSS(this.#code);
            this.#tokens = this.#colorizeCSS(this.#tokens);

            this.#renderLines(code, this.#tokens, this.#startLine);
        }
        else if(this.#type === "html" || this.#type === "htm")
        {
            this.#tokens = this.#parseTokensHTML(this.#code);
            this.#tokens = this.#colorizeHTML(this.#tokens);

            this.#renderLines(code, this.#tokens, this.#startLine);
        }
        else
        {
            this.#tokens = this.#parseTokensText(this.#code);
            this.#renderLines(code, this.#tokens, this.#startLine);
        }
        
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