/********
 * user.js file (services/users)
 ********/
const News = require('../models/news');

const getNews = async (req, res, next) => 
{
    try 
    {
      

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