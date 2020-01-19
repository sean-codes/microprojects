// grab all the projects
const exampleProject = {
   title: '41 Mega pixel ',
   subtitle: 'An example project card',
   builtWith: ['js', 'scss', 'pug'],
   url: '/microprojects/projects/41 Mega Pixel/index.html'
}
const projects = []

for (var i = 0; i < 15; i++) {
   projects[i] = { ...exampleProject }
   projects[i].title += i
}

$(() => {
   $('#site').css({ opacity: 1 })

   let page = 0
   displayProjects(page)

   $buttonPrev = $('#prev')
   $buttonNext = $('#next')

   $buttonPrev.on('click', () => {
      if (page === 0) return
      page -= 1
      displayProjects(page)
   })

   $buttonNext.on('click', () => {
      if (page == Math.ceil(projects.length / 6) - 1) return
      page += 1
      displayProjects(page)
   })

})

function displayProjects(page) {
   // get each of the project containers
   const $containers = $('.project-card')
   $containers.each(containerID => {
      project = projects[page*6 + containerID]
      $container1 = $($containers[containerID])
      displayProject(project, $container1)
   })

   renderPagination(page)
}

function displayProject(project, $container) {
   $container.removeClass('d-none')
   $containerIframe = $container.find('iframe')
   $containerTitle = $container.find('h5')
   $containerSubtitle = $container.find('p')
   $containerBadges = $container.find('.badge')


   // reset project
   $containerTitle.html('')
   $containerSubtitle.html('')
   $containerBadges.each(badgeId => {
      $($containerBadges[badgeId]).html('')
   })

   $container.addClass('loading')

   if (!project) {
      $container.addClass('d-none')
      $containerIframe.attr('src', '')
      return
   }

   $containerIframe.attr('src', project.url)

   $containerIframe.on('load', (e) => {
      $containerTitle = $container.find('h5')
      $containerSubtitle = $container.find('p')
      $containerBadges = $container.find('.badge')
      $container.removeClass('loading')
      $containerTitle.html(project.title)
      $containerSubtitle.html(project.subtitle)
      $containerBadges.each(badgeId => {
         $($containerBadges[badgeId]).html(project.builtWith[badgeId])
      })

      $(e.target).off('load')
   })
}

function renderPagination(page) {
   const $paginationContainer = $('.pagination')
   const $btnPrevious = $paginationContainer.find('#prev')
   const $btnNext = $paginationContainer.find('#next')

   const pagesCount = Math.ceil(projects.length / 6)

   $btnNext.removeClass('disabled')
   $btnPrevious.removeClass('disabled')

   if (page === 0) {
      $btnPrevious.addClass('disabled')
   }

   if (page == pagesCount - 1) {
      $btnNext.addClass('disabled')
   }
}
