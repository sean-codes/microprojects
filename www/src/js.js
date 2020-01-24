$(() => {
   $('#site').css({ opacity: 1 })

   const hash = window.location.hash.replace('#', '')

   // globals
   const $projectsJson = $('#projectsJson')
   const $projectList = $('#projectList')
   const $projectView = $('#projectView')
   const $pagination = $('#pagination')
   const $buttonPrev = $('#prev')
   const $buttonNext = $('#next')
   const $searchInput = $('#searchInput')
   const $searchButton = $('#searchButton')
   const $searchButtonClear = $('#searchButtonClear')
   const $alertNoResults = $('#alertNoresults')
   const $projectOpenButtons = $('#projectList .project-card .btn')
   const $projectViewIframe = $('#projectView iframe')
   const $projectViewTitle = $('#projectView h2')
   const $projectViewDescription = $('#projectView h5')
   const $projectViewButtonBack = $('#projectViewButtonBack')
   const $projectViewButtonFullPageView = $('#projectViewButtonFullPageView')
   const $projectViewButtonSource = $('#projectViewButtonSource')

   // projects
   const projects = JSON.parse($projectsJson.html()).projectsList.sort((a, b) => {
      return (b.sort || 0) - (a.sort || 0)
   })

   let filteredProjects = projects.filter(p => {
      return !p['hide-on-index']
   })
   let page = 0

   // listeners
   $buttonPrev.on('click', prevPage)
   $buttonNext.on('click', nextPage)
   $searchButton.on('click', search)
   $searchInput.on('keyup', searchInput)
   $searchButtonClear.on('click', clearSearch)
   $projectOpenButtons.on('click', openProject)
   $projectViewButtonBack.on('click', backToList)

   if (hash) {
      const project = projects.find(p => p.hash === hash)
      displayProject(project)
   } else displayProjects(page, filteredProjects)

   // some handies
   function nextPage() {
      if (page === Math.ceil(filteredProjects.length / 6) - 1) return
      page += 1
      displayProjects(page, filteredProjects)
   }

   function prevPage() {
      if (page === 0) return
      page -= 1
      displayProjects(page, filteredProjects)
   }

   function clearSearch() {
      $searchInput.val('')
      $searchButtonClear.addClass('d-none')
      search()
   }

   function searchInput(e) {
      $searchButtonClear.toggleClass('d-none', $searchInput.val().length === 0)
      if (e.keyCode === 13) search()
   }

   function search() {
      $alertNoResults.addClass('d-none')
      $pagination.addClass('d-none')

      // why am i using jquery? could have.... e.target.value. dork :]
      const value = $searchInput.val()
      page = 0
      filteredProjects = projects.filter(p => {
         return !value.length
            || p.title.toLowerCase().includes(value.toLowerCase())
            || (p.description && p.description.toLowerCase().includes(value.toLowerCase()))
      })

      if (value === '') {
         filteredProjects = filteredProjects.filter(p => {
            return !p['hide-on-index']
         })
      }

      displayProjects(page, filteredProjects)

      if (filteredProjects.length === 0) {
         $alertNoResults.removeClass('d-none')
      }

      if (filteredProjects.length > 6) {
         $pagination.removeClass('d-none')
      }
   }

   function displayProjects(page, projects) {
      // get each of the project containers
      const $containers = $('.project-card')
      $containers.each(containerID => {
         const project = projects[page*6 + containerID]
         const $container1 = $($containers[containerID])
         displayProjectCard(project, $container1)
      })

      renderPagination(page, projects)
   }

   function displayProjectCard(project, $container) {
      $container.removeClass('d-none')
      const $containerIframe = $container.find('iframe')
      const $containerTitle = $container.find('h5')
      const $containerDescription = $container.find('p')

      // reset project
      $containerTitle.html('')
      $containerDescription.html('')
      $container.addClass('loading')

      if (!project) {
         $container.addClass('d-none')
         $containerIframe.attr('src', '')
         return
      }

      $containerIframe.attr('src', './' + project.path + '/index.html')

      $containerIframe.on('load', (e) => {
         $container.removeClass('loading')
         $containerTitle.html(project.title)
         $containerDescription.html(project.description || 'a microproject!')
         $(e.target).off('load')
      })
   }

   function renderPagination(page, projects) {
      const pagesCount = Math.ceil(projects.length / 6)

      $buttonNext.removeClass('disabled')
      $buttonPrev.removeClass('disabled')

      if (page === 0) {
         $buttonPrev.addClass('disabled')
      }

      if (page == pagesCount - 1) {
         $buttonNext.addClass('disabled')
      }
   }

   function clearProjects() {
      $('iframe').attr('src', '')
   }

   function openProject(e) {
      const projectId = page * 6 + Number(e.delegateTarget.dataset.id)
      const project = filteredProjects[projectId]
      displayProject(project)
   }

   function displayProject(project) {
      clearProjects()
      $projectList.addClass('d-none')
      $projectView.removeClass('d-none')

      $projectViewTitle.html(project.title)
      $projectViewDescription.html(project.description)
      $projectViewIframe.attr('src', './' + project.path + '/index.html')
      $projectViewButtonFullPageView.attr('href', '/microprojects/' + project.path)
      $projectViewButtonSource.attr('href', 'https://github.com/sean-codes/microprojects/tree/master/' + project.path + '/src')

      window.location.hash = project.hash
   }

   function backToList() {
      clearProjects()
      $projectList.removeClass('d-none')
      $projectView.addClass('d-none')

      displayProjects(page, filteredProjects)
      window.location.hash = ''
   }
})
