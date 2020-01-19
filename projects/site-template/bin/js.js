$(() => {
   $('#site').css({ opacity: 1 })

   // globals
   const $projectsJson = $('#projects-json')
   const $pagination = $('#pagination')
   const $buttonPrev = $('#prev')
   const $buttonNext = $('#next')
   const $searchInput = $('#search-input')
   const $searchButton = $('#search-button')
   const $alertNoResults = $('#alert-noresults')

   $buttonPrev.on('click', prevPage)
   $buttonNext.on('click', nextPage)
   $searchButton.on('click', search)
   $searchInput.on('keyup', e => e.keyCode === 13 && search())

   const projects = JSON.parse($projectsJson.html()).projectsList

   let filteredProjects = projects.filter(p => {
      return !p['hide-on-index']
   })
   let page = 0

   displayProjects(page, filteredProjects)

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

   function search() {
      $alertNoResults.addClass('d-none')
      $pagination.addClass('d-none')

      // why am i using jquery? could have.... e.target.value. dork :]
      const value = $searchInput.val()
      page = 0
      filteredProjects = projects.filter(p => {
         return p.title.includes(value)
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
         project = projects[page*6 + containerID]
         $container1 = $($containers[containerID])
         displayProject(project, $container1)
      })

      renderPagination(page, projects)
   }

   function displayProject(project, $container) {
      $container.removeClass('d-none')
      $containerIframe = $container.find('iframe')
      $containerTitle = $container.find('h5')
      $containerDescription = $container.find('p')
      // $containerBadges = $container.find('.badge')


      // reset project
      $containerTitle.html('')
      $containerDescription.html('')
      // $containerBadges.each(badgeId => {
      //    $($containerBadges[badgeId]).html('')
      // })

      $container.addClass('loading')
 
      if (!project) {
         $container.addClass('d-none')
         $containerIframe.attr('src', '')
         return
      }

      $containerIframe.attr('src', '/microprojects/' + project.path)

      $containerIframe.on('load', (e) => {
         $containerTitle = $container.find('h5')
         $containerDescription = $container.find('p')
         $containerBadges = $container.find('.badge')
         $container.removeClass('loading')
         $containerTitle.html(project.title)
         $containerDescription.html(project.description || 'a microproject!')
         // $containerBadges.each(badgeId => {
         //    $($containerBadges[badgeId]).html(project.builtWith[badgeId])
         // })

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
})
