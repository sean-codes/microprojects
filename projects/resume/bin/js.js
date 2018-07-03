// Autoreload Injected by microprojects
if (!window.frameElement) {
   var lastChange = 0
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         var data = JSON.parse(this.responseText)
         if(lastChange && data.changed !== lastChange){
            window.location = window.location;
            return
         }
         lastChange = data.changed
         setTimeout(function() {
            xhttp.open("GET", "../../reload.json", true);
            xhttp.send()
         }, 500)
      }
   };
   xhttp.open("GET", "../../reload.json", true);
   xhttp.send();
}

var resume = new Vue({
   el: "#resume",
   data: {
      name: "Sean Mann",
      title: "Software Developer",
      info: "High energy software developer, passionate about creating scalable code and building paradigm-shifting tech that provides solutions to daily problems. Devoted team-player. Always eager to learn and adapt to new technologies.",
      contactMethods: [
         { icon: 'envelope', url: 'mailto:sean_codes@outlook.com', text: 'sean_codes@outlook.com' },
         { icon: 'phone', url: 'tel:219-682-8575', text: '219-682-8575' },
         { icon: 'github-alt', url: 'https://github.com/sean-codes', text: 'github.com/sean-codes' },
         { icon: 'chrome', url: 'https://sean-codes.github.io', text: 'sean-codes.github.io' },
         { icon: 'codepen', url: 'https://codepen.io/sean_codes', text: 'codepen.io/sean_codes' },
         { icon: 'map-marker', url: 'https://www.google.com/maps/place/Chicago,+IL/', text: 'Chicago' },
      ],
      technicalSkills: [
         'JavaScript/NodeJS',
         'PHP',
         'Java/C#',
         'CSS/SCSS',
         'HTML Templating',
         'Build Tools',
         'CSS Frameworks',
         'RestAPI',
         'Git',
         'Responsive Design',
         'Web Sockets',
         'SQL'
      ],
      personalProjects: [
         {
            title: 'CS-Sockets',
            info: [
               'Built using Node.js',
               'NodeJS server for communicating with web browsers using the web socket protocol ( RFC-6455 )'
            ]
         },
         {
            title: 'CS-Engine',
            info: [
               'Built using HTML5 Canvas and Vanilla JavaScript',
               'Mobile-first 2D game development framework designed to make a single codebase for any platform'
            ]
         },
         {
            title: 'Atom Plugins',
            info: [
               'Built using JavaScript and Electron\'s API',
               'Atom-Browser: Web viewport for the Atom text editor',
               'Atoms-Touchbar: Custom Touch Bar integration for Atom designed to create a more efficient workflow for the frontend dev'
            ]
         },
         {
            title: 'Codepen Projects',
            info: [
               'HTML Preprocessors, SCSS, JavaScript',
               'Various front end projects that push the boundaries of web development in animation and UI design'
            ]
         }
      ],
      workExperience : [
         {
            role: 'Front End Developer',
            company: 'Guaranteed Rate',
            duration: '01/2018 - Present',
            location: 'Chicago, IL',
            info: [
               'Custom nodeJS CMS solution',
               'Creating modular components',
               'Application maintinance'
            ]
         },
         {
            role: 'Full Stack Developer',
            company: 'Apline Home Air',
            duration: '09/2016 - 01/2018',
            location: 'Chicago, IL',
            info: [
               'Building and deploying web application components',
               'Architect custom database',
               'Third party API integrations',
               'Application maintinance',
               'Refactoring and scaling web application according to business growth'
            ]
         },
         {
            role: 'Web Developer / Tech Support',
            company: 'ArrowPOS+POM',
            duration: '06/2015 – 09/2016',
            location: 'Crown Point, IN',
            info: [
               'Network configuration',
               'Scripting to automate system processes',
               'UI/UX Design'
            ]
         }
      ],
      education: [
         {
            title: 'Associates of Science - Computer Science',
            location: 'Ivy Tech Community College',
            duration: '09/2014 – 09/2016'
         },
         {
            title: 'Certificate in CISCO Networking',
            location: 'Porter County Career Center'
         }
      ]
   }
});
