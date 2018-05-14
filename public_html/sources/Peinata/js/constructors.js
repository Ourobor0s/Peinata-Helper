//constructors
function User(id, name) {
    this.id = id;
    this.name = name;
    return this;
}

function Item(desc, price, extraDetails) {
    this.desc = desc;
    this.price = price;
    this.extraDetails = extraDetails;
    return this;
}

function Info(totalPrice, discountedPrice, peinataDiscount) {
    this.totalPrice = totalPrice;
    this.discountedPrice = discountedPrice;
    this.peinataDiscount = peinataDiscount;
    this.discountedPer = (1 - (discountedPrice / totalPrice)).round(6);
    this.discountedPercValue = ((peinataDiscount / totalPrice) * 100).toFixed(2);
            ;
    return this;
}
//