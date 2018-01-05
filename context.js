;(async function() {
  const list = document.getElementById('container-list')

  if (browser.contextualIdentities === undefined) {
    list.innerText =
      'browser.contextualIdentities not available. Check that the privacy.userContext.enabled pref is set to true, and reload the add-on.'
  } else {
    let identities = await browser.contextualIdentities.query({})

    if (!identities.length) {
      list.innerText = 'No identities returned from the API.'
      return
    }

    const ul = document.createElement('ul')
    for (let identity of identities) {
      const li = document.createElement('li')
      li.innerHTML = `<div class="usercontext-icon"
      data-identity-icon="${identity.icon}"
      data-identity-color="${identity.color}"></div>
      <div class="container-name truncate-text">${identity.name}</div>`
      console.log(identity.icon)
      console.log(identity.color)
      ul.appendChild(li)
    }
    list.appendChild(ul)
  }
})().then()
