/*jshint esversion: 8 */
/**
  * @yaireo/relative-time - javascript function to transform timestamp or date to local relative-time
  *
  * @version v1.0.0
  * @homepage https://github.com/yairEO/relative-time
  */

!function (e, t) { var o = o || {}; "function" == typeof o && o.amd ? o([], t) : "object" == typeof exports && "object" == typeof module ? module.exports = t() : "object" == typeof exports ? exports.RelativeTime = t() : e.RelativeTime = t() }(this, (function () { const e = { year: 31536e6, month: 2628e6, day: 864e5, hour: 36e5, minute: 6e4, second: 1e3 }, t = "en", o = { numeric: "auto" }; function n(e) { e = { locale: (e = e || {}).locale || t, options: { ...o, ...e.options } }, this.rtf = new Intl.RelativeTimeFormat(e.locale, e.options) } return n.prototype = { from(t, o) { const n = t - (o || new Date); for (let t in e) if (Math.abs(n) > e[t] || "second" == t) return this.rtf.format(Math.round(n / e[t]), t) } }, n }));

const relativeTime = new RelativeTime({ style: 'narrow' });

const domRefs = {};
const uiGlobals = {
    // Use to store global variables
}
let timerId;
const uiUtils = {
    // Use instead of document.getElementById
    memoRef(elementId) {
        if (!domRefs.hasOwnProperty(elementId)) {
            domRefs[elementId] = {
                count: 1,
                ref: null,
            };
            return document.getElementById(elementId);
        } else {
            if (domRefs[elementId].count < 3) {
                domRefs[elementId].count = domRefs[elementId].count + 1;
                return document.getElementById(elementId);
            } else {
                if (!domRefs[elementId].ref)
                    domRefs[elementId].ref = document.getElementById(elementId);
                return domRefs[elementId].ref;
            }
        }
    },

    // returns dom with specified element
    createElement(tagName, options) {
        const { className, textContent, innerHTML, attributes = {} } = options
        const elem = document.createElement(tagName)
        for (let attribute in attributes) {
            elem.setAttribute(attribute, attributes[attribute])
        }
        if (className)
            elem.className = className
        if (textContent)
            elem.textContent = textContent
        if (innerHTML)
            elem.innerHTML = innerHTML
        return elem
    },

    // Use when a function needs to be executed after user finishes changes
    debounce: (callback, wait) => {
        let timeoutId = null;
        return (...args) => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                callback.apply(null, args);
            }, wait);
        };
    },
    // Limits the rate of function execution
    throttle(func, delay) {
        // If setTimeout is already scheduled, no need to do anything
        if (timerId) {
            return;
        }

        // Schedule a setTimeout after delay seconds
        timerId = setTimeout(function () {
            func();

            // Once setTimeout function execution is finished, timerId = undefined so that in
            // the next scroll event function execution can be scheduled by the setTimeout
            timerId = undefined;
        }, delay);
    },
    // implements event delegation
    delegate(el, event, selector, fn) {
        el.addEventListener(event, function (e) {
            const potentialTarget = e.target.closest(selector)
            if (potentialTarget) {
                e.delegateTarget = potentialTarget
                fn.call(this, e)
            }
        })
    },
    formatTime(timestamp, format) {
        try {
            if (String(timestamp).length < 13)
                timestamp *= 1000
            let [day, month, date, year] = new Date(timestamp).toString().split(' '),
                minutes = new Date(timestamp).getMinutes(),
                hours = new Date(timestamp).getHours(),
                currentTime = new Date().toString().split(' ')

            minutes = minutes < 10 ? `0${minutes}` : minutes
            let finalHours = ``;
            if (hours > 12)
                finalHours = `${hours - 12}:${minutes}`
            else if (hours === 0)
                finalHours = `12:${minutes}`
            else
                finalHours = `${hours}:${minutes}`

            finalHours = hours >= 12 ? `${finalHours} PM` : `${finalHours} AM`
            switch (format) {
                case 'date-only':
                    return `${month} ${date}, ${year}`;
                    break;
                case 'time-only':
                    return finalHours;
                case 'relative':
                    // check if timestamp is older than a day
                    if (Date.now() - new Date(timestamp) < 60 * 60 * 24 * 1000)
                        return `${finalHours}`;
                    else
                        return relativeTime.from(timestamp)
                default:
                    return `${month} ${date}, ${year} at ${finalHours}`;
            }
        } catch (e) {
            console.error(e);
            return timestamp;
        }
    }
};
//Checks for internet connection status
uiGlobals.connectionErrorNotification = []
if (!navigator.onLine)
    uiGlobals.connectionErrorNotification.push(notify('There seems to be a problem connecting to the internet, Please check you internet connection.', 'error'))
window.addEventListener('offline', () => {
    uiGlobals.connectionErrorNotification.push(notify('There seems to be a problem connecting to the internet, Please check you internet connection.', 'error'))
})
window.addEventListener('online', () => {
    uiGlobals.connectionErrorNotification.forEach(notification => notification.remove())
    notify('We are back online.', 'success')
    location.reload()
    uiGlobals.connectionErrorNotification = []
})
let zIndex = 50
// function required for popups or modals to appear
function openPopup(popupId, pinned) {
    zIndex++
    getRef(popupId).setAttribute('style', `z-index: ${zIndex}`)
    return getRef(popupId).show({ pinned })
}

// hides the popup or modal
function closePopup(options = {}) {
    if (popupStack.peek() === undefined)
        return;
    popupStack.peek().popup.hide(options)
}
document.addEventListener('popupopened', async e => {
    //pushes popup as septate entry in history
    history.pushState({ type: 'popup' }, null, null)
    switch (e.target.id) {
        case '':
            break;
    }
})

document.addEventListener('popupclosed', e => {
    switch (e.target.id) {
        case '':
            break;
    }
    if (popupStack.items.length === 0) {
        // if there are no more popups, do something
    }
    zIndex--;
})
window.addEventListener('popstate', e => {
    if (!e.state) return
    switch (e.state.type) {
        case 'popup':
            closePopup()
            break;
    }
})

// displays a popup for asking permission. Use this instead of JS confirm
const getConfirmation = (title, options = {}) => {
    return new Promise(resolve => {
        const { message = '', cancelText = 'Cancel', confirmText = 'OK', danger = false } = options
        getRef('confirm_title').innerText = title;
        getRef('confirm_message').innerText = message;
        const cancelButton = getRef('confirmation_popup').querySelector('.cancel-button');
        const confirmButton = getRef('confirmation_popup').querySelector('.confirm-button')
        confirmButton.textContent = confirmText
        cancelButton.textContent = cancelText
        if (danger)
            confirmButton.classList.add('button--danger')
        else
            confirmButton.classList.remove('button--danger')
        const { opened, closed } = openPopup('confirmation_popup')
        confirmButton.onclick = () => {
            closePopup({ payload: true })
        }
        cancelButton.onclick = () => {
            closePopup()
        }
        closed.then((payload) => {
            confirmButton.onclick = null
            cancelButton.onclick = null
            if (payload)
                resolve(true)
            else
                resolve(false)
        })
    })
}
// displays a popup for asking user input. Use this instead of JS prompt
function getPromptInput(title, message = '', options = {}) {
    let { placeholder = '', isPassword = false, cancelText = 'Cancel', confirmText = 'OK' } = options
    getRef('prompt_title').innerText = title;
    getRef('prompt_message').innerText = message;
    const cancelButton = getRef('prompt_popup').querySelector('.cancel-button');
    const confirmButton = getRef('prompt_popup').querySelector('.confirm-button')
    if (isPassword) {
        placeholder = 'Password'
        getRef('prompt_input').setAttribute("type", "password")
    }
    getRef('prompt_input').setAttribute("placeholder", placeholder)
    getRef('prompt_input').focusIn()
    cancelButton.textContent = cancelText;
    confirmButton.textContent = confirmText;
    openPopup('prompt_popup', true)
    return new Promise((resolve, reject) => {
        cancelButton.addEventListener('click', () => {
            closePopup()
            return null
        }, { once: true })
        confirmButton.addEventListener('click', () => {
            closePopup()
            resolve(getRef('prompt_input').value)
        }, { once: true })
    })
}

//Function for displaying toast notifications. pass in error for mode param if you want to show an error.
function notify(message, mode, options = {}) {
    let icon
    switch (mode) {
        case 'success':
            icon = `<svg class="icon icon--success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"/></svg>`
            break;
        case 'error':
            icon = `<svg class="icon icon--error" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/></svg>`
            options.pinned = true
            break;
    }
    if (mode === 'error') {
        console.error(message)
    }
    return getRef("notification_drawer").push(message, { icon, ...options });
}

// detect browser version
function detectBrowser() {
    let ua = navigator.userAgent,
        tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
}

window.addEventListener('hashchange', e => routeTo(window.location.hash))
window.addEventListener("load", () => {
    const [browserName, browserVersion] = detectBrowser().split(' ');
    const supportedVersions = {
        Chrome: 85,
        Firefox: 75,
        Safari: 13,
    }
    if (browserName in supportedVersions) {
        if (parseInt(browserVersion) < supportedVersions[browserName]) {
            notify(`${browserName} ${browserVersion} is not fully supported, some features may not work properly. Please update to ${supportedVersions[browserName]} or higher.`, 'error')
        }
    } else {
        notify('Browser is not fully compatible, some features may not work. for best experience please use Chrome, Edge, Firefox or Safari', 'error')
    }
    routeTo(window.location.hash)
    document.body.classList.remove('hidden')
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            closePopup()
        }
    })
    document.addEventListener('copy', () => {
        notify('copied', 'success')
    })
    document.addEventListener("pointerdown", (e) => {
        if (e.target.closest("button:not([disabled]),  .interactive")) {
            createRipple(e, e.target.closest("button, .interactive"));
        }
    });
    document.querySelectorAll('.popup__header__close, .close-popup-on-click').forEach(elem => {
        elem.addEventListener('click', () => {
            closePopup()
        })
    })
});

function createRipple(event, target) {
    const circle = document.createElement("span");
    const diameter = Math.max(target.clientWidth, target.clientHeight);
    const radius = diameter / 2;
    const targetDimensions = target.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - (targetDimensions.left + radius)}px`;
    circle.style.top = `${event.clientY - (targetDimensions.top + radius)}px`;
    circle.classList.add("ripple");
    const rippleAnimation = circle.animate(
        [
            {
                transform: "scale(3)",
                opacity: 0,
            },
        ],
        {
            duration: 1000,
            fill: "forwards",
            easing: "ease-out",
        }
    );
    target.append(circle);
    rippleAnimation.onfinish = () => {
        circle.remove();
    };
}

class Router {
    constructor(options = {}) {
        const { routes = {}, state = {}, routingStart, routingEnd } = options
        this.routes = routes
        this.state = state
        this.routingStart = routingStart
        this.routingEnd = routingEnd
        window.addEventListener('hashchange', e => this.routeTo(window.location.hash))
    }
    addRoute(route, callback) {
        this.routes[route] = callback
    }
    set state(state) {
        this._state = state
    }
    async routeTo(path) {
        let page
        let wildcards = []
        let queryString
        let params
        [path, queryString] = path.split('?');
        if (path.includes('#'))
            path = path.split('#')[1];
        if (path.includes('/'))
            [, page, ...wildcards] = path.split('/')
        else
            page = path
        this.state = { page, wildcards }
        if (queryString) {
            params = new URLSearchParams(queryString)
            this.state.params = Object.fromEntries(params)
        }
        if (this.routingStart) {
            this.routingStart(this.state)
        }
        if (this.routes[page]) {
            await this.routes[page](this.state)
            this.state.lastPage = page
        } else {
            this.routes['404'](this.state)
        }
        if (this.routingEnd) {
            this.routingEnd(this.state)
        }
    }
}
const router = new Router({
    routingStart(state) {
        loading()
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }
        window.scrollTo(0, 0);
        if (state.page !== 'home')
            getRef("page_header").classList.remove("hidden");
    },
    routingEnd() {
        loading(false)
    }
})

const appState = {
    params: {},
    openedPages: new Set(),
}
const generalPages = ['sign_up', 'sign_in', 'loading', 'landing']
async function routeTo(targetPage, options = {}) {
    const { firstLoad } = options
    let pageId
    let subPageId1
    let subPageId2
    let searchParams
    let params
    if (targetPage === '') {
        try {
            if (floDapps.user.id)
                pageId = 'chat_page'
        } catch (e) {
            pageId = 'landing'
        }
    } else {
        if (targetPage.includes('/')) {
            let path;
            [path, searchParams] = targetPage.split('?');
            [, pageId, subPageId1, subPageId2] = path.split('/')
        } else {
            pageId = targetPage
        }
    }

    if (!document.querySelector(`#${pageId}`)?.classList.contains('inner-page')) return
    try {
        if (floDapps.user.id && (generalPages.includes(pageId))) {
            history.replaceState(null, null, '#/chat_page');
            pageId = 'chat_page'
        }
    } catch (e) {
        if (!(generalPages.includes(pageId))) return
    }
    appState.currentPage = pageId

    if (searchParams) {
        const urlSearchParams = new URLSearchParams('?' + searchParams);
        params = Object.fromEntries(urlSearchParams.entries());
    }
    if (params)
        appState.params = params
    switch (pageId) {
        case 'sign_in':
            setTimeout(() => {
                getRef('private_key_field').focusIn()
            }, 0);
            break;
        case 'sign_up':
            getRef('keys_generator').generateKeys()
            break;
        default:
            break;
    }

    if (appState.lastPage !== pageId) {
        const animOptions = {
            duration: 100,
            fill: 'forwards',
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }
        document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'))
        getRef(pageId).closest('.page').classList.remove('hidden')
        document.querySelectorAll('.inner-page').forEach(page => page.classList.add('hidden'))
        getRef(pageId).classList.remove('hidden')
        getRef(pageId).animate([
            {
                opacity: 0,
                transform: 'translateY(1rem)'
            },
            {
                opacity: 1,
                transform: 'translateY(0)'
            },
        ],
            {
                duration: 300,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }).onfinish = () => {
            }
        appState.lastPage = pageId
    }
    if (params)
        appState.params = params
    appState.openedPages.add(pageId)

}
// class based lazy loading
class LazyLoader {
    constructor(container, elementsToRender, renderFn, options = {}) {
        const { batchSize = 10, freshRender, bottomFirst = false, onEnd } = options

        this.elementsToRender = elementsToRender
        this.arrayOfElements = (typeof elementsToRender === 'function') ? this.elementsToRender() : elementsToRender || []
        this.renderFn = renderFn
        this.intersectionObserver

        this.batchSize = batchSize
        this.freshRender = freshRender
        this.bottomFirst = bottomFirst
        this.onEnd = onEnd

        this.shouldLazyLoad = false
        this.lastScrollTop = 0
        this.lastScrollHeight = 0

        this.lazyContainer = document.querySelector(container)

        this.update = this.update.bind(this)
        this.render = this.render.bind(this)
        this.init = this.init.bind(this)
        this.clear = this.clear.bind(this)
    }
    get elements() {
        return this.arrayOfElements
    }
    init() {
        if (this.mutationObserver)
            this.mutationObserver.disconnect()
        if (this.intersectionObserver)
            this.intersectionObserver.disconnect()
        this.intersectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    observer.disconnect()
                    this.render({ lazyLoad: true })
                }
            })
        }, {
            root: this.lazyContainer
        })
        this.mutationObserver = new MutationObserver(mutationList => {
            mutationList.forEach(mutation => {
                if (mutation.type === 'childList') {
                    if (mutation.addedNodes.length) {
                        if (this.bottomFirst) {
                            if (this.lazyContainer.firstElementChild)
                                this.intersectionObserver.observe(this.lazyContainer.firstElementChild)
                        } else {
                            if (this.lazyContainer.lastElementChild)
                                this.intersectionObserver.observe(this.lazyContainer.lastElementChild)
                        }
                    }
                }
            })
        })
        this.mutationObserver.observe(this.lazyContainer, {
            childList: true,
        })
        this.render()
    }
    update(elementsToRender) {
        this.arrayOfElements = (typeof elementsToRender === 'function') ? this.elementsToRender() : elementsToRender || []
    }
    render(options = {}) {
        let { lazyLoad = false } = options
        this.shouldLazyLoad = lazyLoad
        const frag = document.createDocumentFragment();
        if (lazyLoad) {
            if (this.bottomFirst) {
                this.updateEndIndex = this.updateStartIndex
                this.updateStartIndex = this.updateEndIndex - this.batchSize
            } else {
                this.updateStartIndex = this.updateEndIndex
                this.updateEndIndex = this.updateEndIndex + this.batchSize
            }
        } else {
            this.intersectionObserver.disconnect()
            if (this.bottomFirst) {
                this.updateEndIndex = this.arrayOfElements.length
                this.updateStartIndex = this.updateEndIndex - this.batchSize - 1
            } else {
                this.updateStartIndex = 0
                this.updateEndIndex = this.batchSize
            }
            this.lazyContainer.innerHTML = ``;
        }
        this.lastScrollHeight = this.lazyContainer.scrollHeight
        this.lastScrollTop = this.lazyContainer.scrollTop
        this.arrayOfElements.slice(this.updateStartIndex, this.updateEndIndex).forEach((element, index) => {
            frag.append(this.renderFn(element))
        })
        if (this.bottomFirst) {
            this.lazyContainer.prepend(frag)
            // scroll anchoring for reverse scrolling
            this.lastScrollTop += this.lazyContainer.scrollHeight - this.lastScrollHeight
            this.lazyContainer.scrollTo({ top: this.lastScrollTop })
            this.lastScrollHeight = this.lazyContainer.scrollHeight
            if (this.updateStartIndex <= 0 && this.onEnd) {
                this.mutationObserver.disconnect()
                this.intersectionObserver.disconnect()
                this.onEnd()
            }
        } else {
            this.lazyContainer.append(frag)
            if (this.updateEndIndex >= this.arrayOfElements.length && this.onEnd) {
                this.mutationObserver.disconnect()
                this.intersectionObserver.disconnect()
                this.onEnd()
            }
        }
        if (!lazyLoad && this.bottomFirst) {
            this.lazyContainer.scrollTop = this.lazyContainer.scrollHeight
        }
        // Callback to be called if elements are updated or rendered for first time
        if (!lazyLoad && this.freshRender)
            this.freshRender()
    }
    clear() {
        this.intersectionObserver.disconnect()
        this.mutationObserver.disconnect()
        this.lazyContainer.innerHTML = ``;
    }
    reset() {
        this.arrayOfElements = (typeof this.elementsToRender === 'function') ? this.elementsToRender() : this.elementsToRender || []
        this.render()
    }
}

const slideInLeft = [
    {
        opacity: 0,
        transform: 'translateX(1.5rem)'
    },
    {
        opacity: 1,
        transform: 'translateX(0)'
    }
]
const slideOutLeft = [
    {
        opacity: 1,
        transform: 'translateX(0)'
    },
    {
        opacity: 0,
        transform: 'translateX(-1.5rem)'
    },
]
const slideInRight = [
    {
        opacity: 0,
        transform: 'translateX(-1.5rem)'
    },
    {
        opacity: 1,
        transform: 'translateX(0)'
    }
]
const slideOutRight = [
    {
        opacity: 1,
        transform: 'translateX(0)'
    },
    {
        opacity: 0,
        transform: 'translateX(1.5rem)'
    },
]
const slideInDown = [
    {
        opacity: 0,
        transform: 'translateY(-1.5rem)'
    },
    {
        opacity: 1,
        transform: 'translateY(0)'
    },
]
const slideOutUp = [
    {
        opacity: 1,
        transform: 'translateY(0)'
    },
    {
        opacity: 0,
        transform: 'translateY(-1.5rem)'
    },
]

function showChildElement(id, index, options = {}) {
    return new Promise((resolve) => {
        const { mobileView = false, entry, exit } = options
        const animOptions = {
            duration: 150,
            easing: 'ease',
            fill: 'forwards'
        }
        const parent = typeof id === 'string' ? document.getElementById(id) : id;
        const visibleElement = [...parent.children].find(elem => !elem.classList.contains(mobileView ? 'hide-on-mobile' : 'hidden'));
        if (visibleElement === parent.children[index]) return;
        visibleElement.getAnimations().forEach(anim => anim.cancel())
        parent.children[index].getAnimations().forEach(anim => anim.cancel())
        if (visibleElement) {
            if (exit) {
                visibleElement.animate(exit, animOptions).onfinish = () => {
                    visibleElement.classList.add(mobileView ? 'hide-on-mobile' : 'hidden')
                    parent.children[index].classList.remove(mobileView ? 'hide-on-mobile' : 'hidden')
                    if (entry)
                        parent.children[index].animate(entry, animOptions).onfinish = () => resolve()
                }
            } else {
                visibleElement.classList.add(mobileView ? 'hide-on-mobile' : 'hidden')
                parent.children[index].classList.remove(mobileView ? 'hide-on-mobile' : 'hidden')
                resolve()
            }
        } else {
            parent.children[index].classList.remove(mobileView ? 'hide-on-mobile' : 'hidden')
            parent.children[index].animate(entry, animOptions).onfinish = () => resolve()
        }
    })
}
function buttonLoader(id, show) {
    const button = typeof id === 'string' ? document.getElementById(id) : id;
    button.disabled = show;
    const animOptions = {
        duration: 200,
        fill: 'forwards',
        easing: 'ease'
    }
    if (show) {
        button.parentNode.append(createElement('sm-spinner'))
        button.animate([
            {
                clipPath: 'circle(100%)',
            },
            {
                clipPath: 'circle(0)',
            },
        ], animOptions)
    } else {
        button.getAnimations().forEach(anim => anim.cancel())
        const potentialTarget = button.parentNode.querySelector('sm-spinner')
        if (potentialTarget) potentialTarget.remove();
    }
}