import Article from '../models/ArticleModel.js';

const getArticles = async (req, res) => {
    try {
        const articles = await Article.find({}).populate('author', 'name').sort({ createdAt: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching articles.' });
    }
};

const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('author', 'name');
        if (article) {
            res.json(article);
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching article.' });
    }
};

const createArticle = async (req, res) => {
    try {
        const { title, content } = req.body;
        const newArticle = new Article({
            title,
            content,
            author: req.user._id,
            imageUrl: req.file.path, // From Cloudinary upload
        });
        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);
    } catch (error) {
        res.status(400).json({ message: 'Invalid article data.' });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (article) {
            await article.deleteOne();
            res.json({ message: 'Article removed' });
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting article.' });
    }
};

export { getArticles, getArticleById, createArticle, deleteArticle };
