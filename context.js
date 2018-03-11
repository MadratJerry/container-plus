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
  identities.forEach((identity, index) => {
    const li = document.createElement('li')
    const iconContainer = document.createElement('div')
    const icon = document.createElement('i')
    const containerName = document.createElement('div')

    iconContainer.className = 'icon'
    icon.style.backgroundImage = `url(${identity.iconUrl})`
    icon.style.filter = `drop-shadow(${identity.colorCode} var(--icon-size) 0)`
    containerName.textContent = identity.name
    containerName.className = 'container-name'
    li.dataset.index = index
    iconContainer.appendChild(icon)
    li.appendChild(iconContainer)
    li.appendChild(containerName)
    ul.appendChild(li)
  })
  ul.addEventListener('click', function(e) {
    e.stopPropagation()
    const li = e.target.parentNode
    const identity = identities[li.dataset.index]
    li.className = 'clicked'
    ul.className = 'disabled'
    ul.removeEventListener('click', arguments.callee)
    handleClick(identity, ['Meta', 'OS'].reduce((pre, cur) => pre || e.getModifierState(cur), false)).then(() =>
      window.close(),
    )
  })
  list.appendChild(ul)
}

async function getCurrentTab() {
  await new Promise(resolve => setTimeout(resolve, 100))
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

  try {
    const newTab = await browser.tabs.create({
      url,
      cookieStoreId,
      index: index + 1,
      pinned,
    })
  } catch (error) {
    await browser.tabs.create({ cookieStoreId, index: index + 1, pinned })
  }
  browser.tabs.remove(id)
}

init()
