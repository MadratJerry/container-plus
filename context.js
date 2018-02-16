async function init() {
  const list = document.getElementById('container-list')

  if (!browser.contextualIdentities) {
    list.innerText =
      'browser.contextualIdentities not available. Check that the privacy.userContext.enabled pref is set to true, and reload the add-on.'
    return
  }

  const identities = await browser.contextualIdentities.query({})

  if (!identities.length) {
    list.innerText = 'No identities returned from the API.'
    return
  }

  const ul = document.createElement('ul')
  identities.push({
    name: 'No-contain',
    icon: 'circle',
    iconUrl: 'resource://usercontext-content/circle.svg',
    color: 'gray',
    colorCode: '#c0c0c0',
    cookieStoreId: 'firefox-default',
  })
  for (let identity of identities) {
    const li = document.createElement('li')
    const iconContainer = document.createElement('div')
    const icon = document.createElement('i')
    const containerName = document.createElement('div')

    iconContainer.className = 'icon'
    icon.style.backgroundImage = `url(${identity.iconUrl})`
    icon.style.filter = `drop-shadow(${identity.colorCode} var(--icon-size) 0)`
    containerName.textContent = identity.name
    containerName.className = 'container-name'
    li.onclick = e => handleClick(identity, e.getModifierState('Meta')).then(() => window.close())

    iconContainer.appendChild(icon)
    li.appendChild(iconContainer)
    li.appendChild(containerName)
    ul.appendChild(li)
  }
  list.appendChild(ul)
}

async function getCurrentTab() {
  const [currentTab] = await browser.tabs.query({ currentWindow: true, active: true })
  const { status, url } = currentTab
  return status === 'loading' && url === 'about:blank' ? await getCurrentTab() : currentTab
}

async function handleClick({ cookieStoreId }, isPressed) {
  if (isPressed) {
    await browser.tabs.create({ cookieStoreId })
    return
  }

  const currentTab = await this.getCurrentTab()
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

init()
