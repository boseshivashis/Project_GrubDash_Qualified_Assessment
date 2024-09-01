const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
const notFound = require("../errors/notFound");

// Use this function to assign IDs when necessary
const nextId = require("../utils/nextId");

function validateDishInput(req, res, next) {

    if(req.body.data) {
      const { id, name, description, price, image_url } = req.body.data;
      isInputFieldEmpty(name, next, "name");
      isInputFieldEmpty(description, next, "description");
      isInputFieldEmpty(price, next, "price");
      isInputFieldEmpty(image_url, next, "image_url");
      validatePrice(price, next);
      next();
    } else {
      next({
        status: 404,
        message: `Dish Record is not available`
      })
    }
  
}

function validatePrice(price, next) {
    // Check if quantity is not an integer
    if (!Number.isInteger(price)) {
        return next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        });
    }

    // Check if quantity is less than or equal to 0
    if (price <= 0) {
        return next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        });
    }
}

function isInputFieldEmpty(fieldValue, next, fieldName) {
    if (!fieldValue || fieldValue === "") {
       return  next({
            status: 400,
            message: `Dish must include a ${fieldName}`
        });
    }
}

function doesDishRecordExist(req, res, next) {
    const dishId = req.params.dishId;

    if (dishId) {
        const dishRecord = dishes.find( (dish) => dish.id === dishId);
        if(dishRecord) {
            res.locals.dishRecord = dishRecord;
            next();
        } else {
            next({
                status: 404,
                message: `No Matching Record found for Dish id ${dishId}`
            })
        }
    } else {
      
        next({
            status: 500,
            message: `Dish Id is null and not available`
        })
    }
}

function list(req, res) {
    res.status(200).json({ data: dishes });
}

function create(req, res, next) {
    const { name, description, price, image_url } = req.body.data;
  const newDishId = nextId();

    const newDishRec = {
        id: newDishId, 
        name: name,
        description: description,
        price: Number(price), // Ensure price is a number
        image_url: image_url
    };

    // Add this record to list of dishes
    dishes.push(newDishRec);

    res.status(201).json({ data: newDishRec });
}

function update(req, res, next) {
    const dishId = req.params.dishId;

    let dishRecordForUpdate = res.locals.dishRecord;
    const { id, name, description, price, image_url } = req.body.data;

    if(!id || id === dishId) {
      dishRecordForUpdate.id = dishId;
      dishRecordForUpdate.name = name;
      dishRecordForUpdate.description = description;
      dishRecordForUpdate.price = price;
      dishRecordForUpdate.image_url = image_url;
      res.status(200).json({data: dishRecordForUpdate});
    } else {
      res.status(400).json({error: `Data.id ${id} does not match with dish id parameter ${dishId}`})
    } 
}
  


function read(req, res) {
    res.status(200).json({ data: res.locals.dishRecord
                      });
}

module.exports = {
    list,
    create: [validateDishInput, create],
    read: [doesDishRecordExist, read],
    update: [validateDishInput, update],
    doesDishRecordExist
};