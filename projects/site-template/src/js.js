// grab all the projects
const projects = [
   {
      title: '41 Mega pixel 1',
      subtitle: 'An example project card',
      builtWith: ['js', 'scss', 'pug'],
      url: '/microprojects/projects/41 Mega Pixel/index.html'
   },
   {
      title: '41 Mega pixel 2',
      subtitle: 'An example project card',
      builtWith: ['js', 'scss', 'pug'],
      url: '/microprojects/projects/41 Mega Pixel/index.html'
   },
   {
      title: '41 Mega pixel 3',
      subtitle: 'An example project card',
      builtWith: ['js', 'scss', 'pug'],
      url: '/microprojects/projects/41 Mega Pixel/index.html'
   },
   {
      title: '41 Mega pixel 4',
      subtitle: 'An example project card',
      builtWith: ['js', 'scss', 'pug'],
      url: '/microprojects/projects/41 Mega Pixel/index.html'
   },
   {
      title: '41 Mega pixel 5',
      subtitle: 'An example project card',
      builtWith: ['js', 'scss', 'pug'],
      url: '/microprojects/projects/41 Mega Pixel/index.html'
   },
   {
      title: '41 Mega pixel 6',
      subtitle: 'An example project card',
      builtWith: ['js', 'scss', 'pug'],
      url: '/microprojects/projects/41 Mega Pixel/index.html'
   }
]

$(() => {
   $('#site').css({ opacity: 1 })
   displayProjects()

   $buttonPrev = $('#prev')
   $buttonNext = $('#next')

   $buttonPrev.on('click', () => {
      console.log('previous')
   })

   $buttonNext.on('click', () => {
      console.log('next')
      displayProjects()
   })
})

function displayProjects(start, end) {
   // get each of the project containers
   const $containers = $('.project-card')
   $containers.each(containerID => {
      project = projects[containerID]
      $container1 = $($containers[containerID])
      displayProject(project, $container1)
   })
}

function displayProject(project, $container) {
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
   $containerIframe.attr('src', project.url)

   $containerIframe.on('load', () => {
      $containerTitle = $container.find('h5')
      $containerSubtitle = $container.find('p')
      $containerBadges = $container.find('.badge')
      $container.removeClass('loading')
      $containerTitle.html(project.title)
      $containerSubtitle.html(project.subtitle)
      $containerBadges.each(badgeId => {
         $($containerBadges[badgeId]).html(project.builtWith[badgeId])
      })
   })
}
