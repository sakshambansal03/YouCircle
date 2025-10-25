import React, { useState, useEffect } from 'react';
import './Banner.css';
import axios from './axios';
import requests from './request';

function Banner() {

  const [movie, setMovie] = useState([]);

  useEffect(()=> {
    async function fetchData(){
        const request = await axios.get(requests.fetchNetflixoriginals);
        setMovie(request.data.results[Math.floor(Math.random()*request.data.results.length - 1)]);
        return request;
    } 
    fetchData();
  }, []);
  
  function truncate(str, n){
    return str?.length > n ? str.substring(0, n - 1) + '...' : str;
  }

  return (
    <header className="banner" style={{
        backgroundSize: "cover", 
        backgroundImage: `url("https://image.tmdb.org/t/p/original/${movie?.backdrop_path}")`,
        backgroundPosition: "center center",
    }}>
        <div className='banner-content'> 
            <h1 className='banner-title'> {movie?.title || movie?.name || movie?.original_name} </h1>
            <h1 className='banner-description'> {truncate(movie?.overview, 190)} </h1>
            <div className='banner-buttons'> 
              <button className="banner-button"><i className="fas fa-play"></i> Play </button> 
              <button className="banner-button"><i className="fas fa-list"></i> My List</button>
            </div>
        </div>
        <div className='banner-fade-bottom' />
    </header>
  );
}

export default Banner;
