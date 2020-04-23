const News = require('../models/news');
const { ObjectId } = require('mongoose').Types;

const getNews = async (req, res, next) => 
{
    try 
    {
       const listOfNews = await News.find({ })
       return res.status(200).json(listOfNews)
    } catch (error) 
    {
        console.log(error);
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const getNewsById = async (req, res, next) => 
{
    try 
    {
      const newsId = req.params.id;

      if (!ObjectId.isValid(newsId)) return res.status(400).send("Invalid type of Id");

      const news = await News.findById(newsId)
      return res.status(200).json(news);
      
    } catch (error) 
    {
        console.log(error);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const createNews = async (req, res, next) => 
{   
    try 
    {
      const { title, content, author } = req.body;
      const newNews = await News.create( { title, content, author } );

      if(newNews) return res.status(201).json(newNews)
      else throw Error('Something wrong when create a new News');

    } catch (error) 
    {
        console.log(error);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const updateNews = async (req, res, next) => 
{
    try 
    {
      const newsId = req.params.id;
      const { title, content, author } = req.body;

      if (!ObjectId.isValid(newsId)) return res.status(400).send("Invalid type of Id");

      const news = await News.findOneAndUpdate({ _id:newsId }, { title, content, author }, { new: true});
      return res.status(200).json(news);

    } catch (error) 
    {
        console.log(error);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const deleteNews = async (req, res, next) => 
{
    try 
    {
      const newsId = req.params.id;
      if (!ObjectId.isValid(newsId)) return res.status(400).send("Invalid type of Id");

      await News.findByIdAndRemove(newsId);
      return res.status(200).send();

    } catch (error) 
    {
        console.log(error);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

module.exports = {
  getNews, getNewsById , createNews ,updateNews, deleteNews
};