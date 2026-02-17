const invModel = require("../models/inventory-model");
const accModel = require("../models/account-model");
const util = {};
const jwt = require("jsonwebtoken")
require("dotenv").config()


/**
 * Constructs the nav HTML unordered list
 */

util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications();
    // console.log(data);

    let list = "<button id='hamburger'>&#9776;</button>";
    list += "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach(row => {
        list += "<li>";
        list += '<a href="/inv/type/' +
            row.classification_id +
            '" title="See out inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>";
        list += "</li>";
    });
    list += "</ul>";
    return list
}

util.buildClassificationGrid = async function (data) {
    let grid;
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id +
                '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + 'details"><img src="' + vehicle.inv_thumbnail +
                '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model +
                ' on CSE Motors" /></a>';
            grid += '<div class="namePrice">'
            // grid += '<hr />';
            grid += '<h2>';
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' +
                vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' +
                vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';

            grid += '<h2>';
            grid += '<span>$' +
                new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
            grid += '</div>';
            grid += '</li>';

        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
}

util.buildClassificationList = async function (classification_id = null) {
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

util.buildDetailPage = async function (data) {
    try {

        if (!data) {
            // If data is null, simulate server error
            throw new Error("Failed to fetch inventory data");
        }

        let grid;
        grid = `<div class=grid>`;
        grid += `<h1 class="title">${data.inv_make} ${data.inv_model}</h1>`;
        grid += `<img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model} on CSE Motors" class="image"/>`;
        grid += `<p class="desc">${data.inv_description}</p>`;
        grid += `<p class="price"><b>Price</b>: <span>$
                ${new Intl.NumberFormat('en-US').format(data.inv_price)} </span></p>`;
        grid += `<p  class="miles"><b>Miles</b>: ${new Intl.NumberFormat('en-US').format(data.inv_miles)}</p>`;
        grid += `<p  class="color"><b>Color</b>: ${data.inv_color}</p>`;
        grid += `<p  class="type"><b>Type</b>: <a href="../../inv/type/${data.classification_id}" title="Type of ${data.classification_name} vehicles">${data.classification_name}</a></p>`;
        grid += `</div>`;
        return grid;
    } catch (error) {
        console.error('Error building detail page:', error);
        return `
        <div class="error-message">
            <h2>Error Loading Vehicle Details</h2>
            <p>An error occurred while loading the vehicle details. Please try again later.</p>
        </div>
    `;
    }
}

util.buildLogin = async function (req, res) {
    const nav = await util.getNav();
    res.render("login", { title: "Login", nav });
}   

util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


/* ****************************************
 * Middleware to check token validity
 **************************************** */
// util.checkJWTToken = (req, res, next) => {
//     if (req.cookies.jwt) {
//         jwt.verify(
//             req.cookies.jwt,
//             process.env.ACCESS_TOKEN_SECRET,
//             function (err, accountData) {
//                 if (err) {
//                     req.flash("Please log in")
//                     res.clearCookie("jwt")
//                     return res.redirect("/account/login")
//                 }
//                 res.locals.accountData = accountData
//                 res.locals.loggedin = 1
//                 next()
//             })
//     } else {
//         next()
//     }
// }

util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            async function (err, accountData) {
                if (err) {
                    req.flash("notice", "Please log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }

                // 1. Fetch current data to ensure user still exists in DB
                const currentAccountData = await accModel.getAccountById(accountData.account_id)

                if (!currentAccountData) {
                    // Case: Token is valid, but user was deleted from DB
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }

                // 2. Check if sensitive info has changed (Sync Check)
                const needsUpdate =
                    currentAccountData.account_firstname !== accountData.account_firstname ||
                    currentAccountData.account_lastname !== accountData.account_lastname ||
                    currentAccountData.account_email !== accountData.account_email;

                if (needsUpdate) {
                    // 3. Update token with fresh data (excluding password)
                    delete currentAccountData.account_password
                    const accessToken = jwt.sign(currentAccountData, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: 3600 * 1000
                    })
                    res.cookie("jwt", accessToken, {
                        httpOnly: true,
                        maxAge: 3600 * 1000
                    })
                    // Update the local variable for the current request
                    accountData = currentAccountData
                }

                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            }
        )
    } else {
        next()
    }
}

/* ****************************************
 *  Check Login
 * ************************************ */
util.checkLogin = (req, res, next) => {
    console.log("checking login")
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}

/* ****************************************
 *  Check Account Type
 * ************************************ */
util.checkAccountType = (req, res, next) => {
    if (res.locals.loggedin && res.locals.accountData) {
        const accountType = res.locals.accountData.account_type;
        if (accountType === "Employee" || accountType === "Admin") {
            next();
        } else {
            req.flash("notice", "Access denied. Employee or Admin account required.");
            return res.redirect("/account/login");
            // return res.redirect(req.get('Referer') || '/');
        }
    } else {
        req.flash("notice", "Please log in with an Employee or Admin account.");
        return res.redirect("/account/login");
        // return res.redirect(req.get('Referer') || '/');
    }
}
module.exports = util;