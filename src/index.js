require('dotenv').config(); // Load environment variables from .env file

// Import the discord.js library
const { Client, IntentsBitField } = require('discord.js');

// Import the node-fetch library to make HTTP requests to the TMDB API
const fetch = require('node-fetch');

// Create a new Discord client
const client = new Client({
  intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
  ],
})

// Set your TMDB Access Token here
const tmdbAccessToken = process.env.TMDB_ACCESS_TOKEN;

// Authenticates with TMDB
const url = 'https://api.themoviedb.org/3/authentication';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${tmdbAccessToken}`
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));

// Fetches most popular tv shows from TMDB
client.on('messageCreate', message => {
  if (message.content === '!popular shows') {
    fetch('https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc', options)
      .then(response => response.json())
      .then(response => {
        let popularTV = response.results.map(show => show.name).join('\n');
        message.channel.send(`Here are the most currently popular TV shows:\n${popularTV}`);
      })
      .catch(err => console.error(err));
  }
});

// Fetches most popular movies from TMDB
client.on('messageCreate', message => {
  if (message.content === '!popular movies') {
    fetch('https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc', options)
      .then(response => response.json())
      .then(response => {
        let popularMovies = response.results.map(movie => movie.title).join('\n');
        message.channel.send(`Here are the most currently popular movies:\n${popularMovies}`);
      })
      .catch(err => console.error(err));
  }
});

// Outputs first result of a movie search
client.on('messageCreate', async message => {
  if (message.content.startsWith('!searchmovie ')) {
    const movieTitle = message.content.replace('!searchmovie ', '');
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movieTitle)}&include_adult=false&language=en-US&page=1`, options);
    const data = await response.json();
    let firstResult = data.results[0];
    let movieDescription = firstResult.overview;
    let releaseDate = firstResult.release_date;
    let tmdbLink = `https://www.themoviedb.org/movie/${firstResult.id}`;
    message.channel.send(`Here is the first search result for "${movieTitle}":\n\n${movieDescription}\n\nRelease Date: ${releaseDate}\n\nTMDB Link: ${tmdbLink}`);
  }
  else if (message.content === '!searchmovie') { // If no movie title is entered
    message.channel.send('Please enter a movie title to search for.');
  }
});

// Outputs first result of a tv show search
client.on('messageCreate', async message => {
  if (message.content.startsWith('!searchshow ')) {
    const tvTitle = message.content.replace('!searchshow ', '');
    const response = await fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(tvTitle)}&include_adult=false&language=en-US&page=1`, options);
    const data = await response.json();
    let firstResult = data.results[0];
    let tvDescription = firstResult.overview;
    let releaseDate = firstResult.first_air_date;
    let tmdbLink = `https://www.themoviedb.org/tv/${firstResult.id}`;
    message.channel.send(`Here is the first search result for "${tvTitle}":\n\n${tvDescription}\n\nRelease Date: ${releaseDate}\n\nTMDB Link: ${tmdbLink}`);
  }
  else if (message.content === '!searchshow') { // If no tv show title is entered
    message.channel.send('Please enter a TV show title to search for.');
  }
});

client.on('messageCreate', message => { // Outputs list of commands
  if (message.content === '!help') {
    message.channel.send('Here are the commands you can use:\n\n!popular shows [displays currently popular shows]\n\n!popular movies [displays currently popular movies]\n\n!searchmovie [movie title]\n\n!searchshow [tv show title]');
  }
});

// Event handler for when the bot is ready
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Login to Discord with your bot token
client.login(process.env.BOT_TOKEN);