const API_KEY = 'b343c04c4ffb3a18f394536847180563';

const requests = { 
    fetchTrending: '/trending/all/week?api_key='+ API_KEY + '&language=en-US', 
    fetchNetflixoriginals:'/discover/tv?api_key='+ API_KEY + '&with_networks=213',
    fetchTopRated:'/movie/top_rated?api_key='+ API_KEY + '&language=en-US',
    fetchActionMovies: '/discover/movie?api_key='+ API_KEY + '&with_genres=28',
    fetchComedyMovies: 'discover/movie?api_key='+ API_KEY + '&with_genres=35',
    fetchHorrorMovies:'/discover/movie?api_key='+ API_KEY + '&with_genres=27', 
    fetchRomanceMovies:'/discover/movie?api_key='+ API_KEY + '&with_genres-10749',
    fetchDocumentaries:'/discover/movie?api_key='+ API_KEY + '&with_genres=99',
}

export default requests

//https://api.themoviedb.org/3/trending/all/week?api_key=b343c04c4ffb3a18f394536847180563&language=en-US
//https://api.themoviedb.org/3/discover/tv?api_key=b343c04c4ffb3a18f394536847180563&with_networks=213
//https://api.themoviedb.org/3/movie/32?api_key=b343c04c4ffb3a18f394536847180563&language=en-US&append_to_response=videos
//https://api.themoviedb.org/3/movie/550/videos?api_key=b343c04c4ffb3a18f394536847180563
