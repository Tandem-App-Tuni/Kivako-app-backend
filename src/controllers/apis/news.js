const express = require('express');
const auth = require('../../auth/auth')
const newsService = require('../../services/news');
let router = express.Router();

//Get a list of news
//http://localhost:3000/api/v1/news // GET REQUEST
router.get('/', newsService.getNews);

// Create a new News
//http://localhost:3000/api/v1/news // POST REQUEST
router.post('/', auth.checkIfUserIsAuthenticatedAndAdmin, newsService.createNews);

//Get a news by newsId
//http://localhost:3000/api/v1/news/{id} // GET REQUEST
router.get('/:id', newsService.getNewsById);

//Update a news by newsId
//http://localhost:3000/api/v1/news/{id} // PUT REQUEST
router.put('/:id', auth.checkIfUserIsAuthenticatedAndAdmin , newsService.updateNews);

//Delete a news by newsId
//http://localhost:3000/api/v1/admin/studentUsers // DELETE REQUEST
router.delete('/:id', auth.checkIfUserIsAuthenticatedAndAdmin , newsService.deleteNews);

module.exports = router;