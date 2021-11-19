var eventBus = new Vue()

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        },
        empty: {
            type: Boolean,
            required: true
        }

    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },

    template: `
    <div class="product">
        <div class="product-image">
            <img :src="image">
        </div>

        <div class="product-info">
            <h1>{{ title }}</h1>
            <p v-if="inStock > 10">In Stock</p>
            <p v-else-if="inStock <= 10 && inStock > 0">Almost Sold Out!</p>
            <p v-else :class="{ outOfStock: inStock === 0} ">Out of Stock</p>
            <p>{{sale}}</p>
            <p>User is premium: {{ premium }}</p>
            <p>Shipping cost: {{ shipping }}</p>
            <product-details :details="details"></product-details>

            <div class="color-box" v-for="(variant, index) in variants" :key="variant.variantId"
                :style="{backgroundColor: variant.variantColor}" @mouseover="updateProduct(index)">

            </div>
        
            <button @click="addToCart" :disabled="inStock < 10" :class="{ disabledButton: inStock < 10}">Add to
                cart</button>
            <button v-show="!empty" @click="removeFromCart">Remove from cart</button>
        
        </div>
        <div> 
            <product-tabs :reviews="reviews"></product-tabs>
        </div>
        
    </div>
    `,
    data() {
        return {
            product: "Socks",
            brand: "Vue Mastery",
            onSale: false,
            selectedVariant: 0,
            details: ["80% cotton", "20% polyester", "Gender-neutral"],
            sizes: ["SM", "M", "L", "XL"],
            variants: [
                {
                    variantId: 2234,
                    variantColor: "green",
                    variantImage: "./assets/vmSocks-green.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: "blue",
                    variantImage: "./assets/vmSocks-blue.png",
                    variantQuantity: 10
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct(index) {
            this.selectedVariant = index
        },
        addReview(productReview) {
            this.reviews.push(productReview)
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' ' + 'is on sale!'
            }
        },
        shipping() {
            if (this.premium) {
                return "Free"
            } else {
                return 2.99
            }
        }
    }
})



Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
        <ul>
            <li v-for="detail in details">{{detail}}</li>
        </ul>
    `
})

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
        <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name" placeholder="name">
        </p>
        <p>
            <label for="review">Review:</label>
            <textarea id="review" v-model="review"></textarea>
        </p>

        <p>
            <label for="rating">Rating</label>
            <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
            </select>
        </p>
        <p>
            <input type="submit" value="Submit">
        </p>
        <p>
            <ul v-show="errors.length > 0">
                <li v-for="error in errors">
                    {{error}}
                </li>
            </ul>
        </p>
    </form>
    
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.errors = []
            } else {
                this.errors = []
                if (!this.name) this.errors.push("Name required")
                if (!this.review) this.errors.push("Review required")
                if (!this.rating) this.errors.push("Rating required")
            }

        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
        <div>
            <div>
            <span 
                :class="{activeTab: selectedTab === tab}"
                v-for="(tab, index) in tabs" 
                    :key="index"
                    @click="setSelectedTab(tab)"
                    > {{tab}}</span>
            </div>

            <div v-show="selectedTab === 'Reviews'"> 
            <p v-show="reviews.length === 0">There are no reviews</p>
                <ul>
                <li v-for="review in reviews"> 
                    <p> Name: {{review.name}}</p>
                    <p> Review: {{review.review}}</p>
                    <p> Rating: {{review.rating}}</p>
                </li>
                </ul>
            </div>

            <div v-show="selectedTab === 'Make a Review'"> 
                <product-review></product-review>
            </div>
        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    },
    methods: {
        setSelectedTab(tab) {
            this.selectedTab = tab
        }
    }
})



var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        addToCart(id) {
            this.cart.push(id)
        },
        removeFromCart(id) {
            this.cart = this.removeFirstOccurence(id)
        },
        removeFirstOccurence(id) {
            let index = this.findIdx(id, 0)

            if (index > -1) {
                return this.cart.filter((ele, idx) => idx !== index)
            }
            return this.cart
        },

        findIdx(id, idx) {
            if (this.cart[idx] === id) return idx
            if (this.cart.length === idx) return -1
            return this.findIdx(id, idx + 1)
        },



    },
    computed: {
        isCartEmpty() {
            return this.cart.length === 0
        }
    }
})
