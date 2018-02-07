class ContainerPlus {
  constructor() {
    this.init()
  }

  async init() {
    const list = document.getElementById('container-list')

    if (!browser.contextualIdentities) {
      list.innerText =
        'browser.contextualIdentities not available. Check that the privacy.userContext.enabled pref is set to true, and reload the add-on.'
      return
    }

    this.identities = await browser.contextualIdentities.query({})
    const { identities, handleClick } = this

    if (!identities.length) {
      list.innerText = 'No identities returned from the API.'
      return
    }

    const ul = document.createElement('ul')
    for (let identity of identities) {
      const li = document.createElement('li')
      li.onclick = () => handleClick(identity)
      li.innerHTML = `<div
        class="usercontext-icon"
        data-identity-icon="${identity.icon}"
        data-identity-color="${identity.color}"></div>
        <div class="container-name truncate-text">${identity.name}</div>`
      li.dataset.cookieStoreId = identity.cookieStoreId
      ul.appendChild(li)
    }
    list.appendChild(ul)
  }

  async handleClick({ cookieStoreId }) {
    const [currentTab] = await browser.tabs.query({ currentWindow: true, active: true })
    const { id, url, index, pinned } = currentTab

    if (currentTab.cookieStoreId === cookieStoreId) return

    const newTab = await browser.tabs.create({
      url,
      cookieStoreId,
      index: index + 1,
      pinned,
    })
    browser.tabs.remove(id)
  }
}

const container = new ContainerPlus()
