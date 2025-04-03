const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul class='nav-menu'>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ************************
 * Middleware Global dates
 ************************** */
Util.addGlobalVariables = async (req, res, next) => {
  try {
    res.locals.nav = await Util.getNav();
    res.locals.breadcrumbs = Util.getBreadcrumbs(req);
    res.locals.header = "CSE Motors - Header";
    res.locals.footer = "CSE Motors - Footer";
    next();
  } catch (error) {
    next(error);
  }
};


Util.getBreadcrumbs = function (req, classification_id) {
  const pathArray = req.path.split("/").filter((p) => p);
  let breadcrumb = `<nav class="breadcrumb"><a href="/">Home</a>`;
  let path = "";

  for (let i = 0; i < pathArray.length; i++) {
    let segment = pathArray[i];
    let displayName = segment;

    if (segment === "inv") continue;
    if (segment === "type") continue;

    if (segment === "detail") {
      displayName = "Vehicle Details";
      path = `/inv/type/${classification_id}`;
    } else {
      path += `/${segment}`;
    }

    if (i === pathArray.length - 1) {
      breadcrumb += ` > <span>${displayName}</span>`;
    } else {
      breadcrumb += ` > <a href="${path}">${displayName}</a>`;
    }
  }

  breadcrumb += `</nav>`;
  return breadcrumb;
};





/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id
        + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + 'details"><img src="' + vehicle.inv_thumbnail
        + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$'
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)



module.exports = Util