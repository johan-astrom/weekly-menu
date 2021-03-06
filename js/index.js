const mapState = Vuex.mapState
const mapMutations = Vuex.mapMutations
const mapActions = Vuex.mapActions

const formData = {
    state: {
        title: '',
        ingredientName: '',
        ingredientQty: '',
        ingredientWeight: '',
        ingredients: [],
        weekday: '',
        image: '',
        alt: ''
    },
    mutations: {
        setTitle(state, title) {
            state.title = title
        },
        setIngredientName(state, ingredientName) {
            state.ingredientName = ingredientName
        },
        setIngredientQty(state, ingredientQty) {
            state.ingredientQty = ingredientQty
        },
        setIngredientWeight(state, ingredientWeight) {
            state.ingredientWeight = ingredientWeight
        },
        setIngredients(state, ingredients) {
            state.ingredients = ingredients
        },
        setWeekday(state, weekday) {
            state.weekday = weekday
        },
        setImage(state, image) {
            state.image = image
        },
        setAlt(state, alt) {
            state.alt = alt
        }
    },
    actions: {
        setToCurrent({commit, rootState}) {
            let recipe = rootState.currentRecipe

            commit('setTitle', recipe.title)
            commit('setIngredients', recipe.ingredients.slice())
            commit('setWeekday', recipe.weekday)
            commit('setImage', recipe.image)
            commit('setAlt', recipe.alt)
        }
    }
}

const store = new Vuex.Store({
    modules: {
        formData: formData
    },
    state: {
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        recipes: [],
        currentRecipe: '',
        hideAll: false,
        showRecipe: false,
        showRecipes: false,
        showForm: false,
        showRecipeSavedMsg: false,
        showTodaysRecipe: false,
        showShoppingList: false,
        update: false,
        assignedWeekday: ''
    },
    getters: {},
    mutations: {
        saveRecipe(state, recipe) {
            state.recipes.push(recipe)
            state.currentRecipe = ''
        },
        deleteRecipe(state) {
            let pos = state.recipes.indexOf(state.currentRecipe)
            state.recipes.splice(pos, 1)
            state.showTodaysRecipe = false
            state.currentRecipe = ''
        },
        updateRecipe(state) {
            state.showForm = true
            state.update = true
        },
        saveRecipeUpdate(state, recipe) {
            let pos = state.recipes.indexOf(state.currentRecipe)
            state.recipes[pos] = recipe
        },
        loadRecipes(state, recipes) {
            state.recipes = recipes
        },
        updateRecipes(state) {
            localStorage.setItem('recipes-array', JSON.stringify(state.recipes))
        },
        hideAll(state) {
            state.showRecipe = false
            state.showForm = false
            state.showRecipeSavedMsg = false
            state.showTodaysRecipe = false
            state.showRecipes = false
            state.showShoppingList = false
            state.update = false
        },
        showRecipe(state, weekday) {
            state.showTodaysRecipe = true
            state.currentRecipe = state.recipes.find(x => x.weekday === weekday)
        },
        showRecipes(state) {
            state.showRecipes = true
        },
        showShoppingList(state) {
            state.showShoppingList = true
        },
        setCurrentRecipe(state, recipe) {
            state.currentRecipe = recipe
        },
        setAssignedWeekday(state, weekday) {
            state.assignedWeekday = weekday
        },
        removeDuplicates(state, recipe) {
            for (let i = 0; i < state.recipes.length; i++) {
                if (state.recipes[i] !== recipe) {
                    if (state.recipes[i].weekday === recipe.weekday) {
                        state.recipes[i].weekday = ''
                    }
                }
            }
        },
        changePurchased(state, ingredient) {
            ingredient.purchased = !ingredient.purchased
        },
        displayForm(state){
            state.showForm = true
            state.showRecipeSavedMsg = false
        },
        displayRecipeSavedMsg(state){
            state.showForm = false
            state.showRecipeSavedMsg = true
        },
        assignWeekday(state){
            if (state.assignedWeekday === '-- none --') {
                state.currentRecipe.weekday = ''
                state.currentRecipe.image = ''
                state.showTodaysRecipe = false
            } else {
                state.currentRecipe.weekday = state.assignedWeekday
                state.currentRecipe.image = `img/${state.assignedWeekday}.jpg`
            }
        }
    },
    actions: {
        saveRecipe({state, commit}, recipe) {
            commit('saveRecipe', recipe)
            commit('removeDuplicates', recipe)
        },
        loadRecipes({commit}) {
            if (localStorage.getItem('recipes-array')) {
                let recipes = JSON.parse(localStorage.getItem('recipes-array'))
                commit('loadRecipes', recipes)
            }
        },
        deleteRecipe({state, commit}) {
            if (confirm('Are you sure you want to delete recipe: ' + state.currentRecipe.title + '?')) {
                commit('deleteRecipe')
                commit('updateRecipes')
            }
        },
        updateRecipe({commit, state}) {
            commit('hideAll')
            commit('updateRecipe')
        },
        saveRecipeUpdate({commit}, recipe) {
            commit('saveRecipeUpdate', recipe)
            commit('removeDuplicates', recipe)
            commit('updateRecipes')
        },
        saveRecipeActions({state, commit}, recipe) {
            commit('updateRecipes')
            commit('removeDuplicates', recipe)
            commit('displayRecipeSavedMsg')
        },
        displayForm({commit}) {
            commit('hideAll')
            commit('displayForm')
        },
        assignWeekday({state, commit}) {
            commit('assignWeekday')
            if (state.assignedWeekday !== '-- none --') {
                commit('removeDuplicates', state.currentRecipe)
            }
            commit('updateRecipes')
        },
        changePurchased({commit}, ingredient) {
            commit('changePurchased', ingredient)
            commit('updateRecipes')
        }
    }
})
Vue.component('week-table', {
    template: `
          <article id="week-grid">
          <h2 v-for="weekday in weekdays">{{ weekday }}</h2>
          <figure v-for="(recipe, index) in recipes"
                  v-if="recipe.weekday"
                  :key="index"
                  :style="{gridArea: position(recipe)}"
                  @mouseover="hoveredWeekday=recipe.weekday"
                  @mouseleave="hoveredWeekday=''"
                  :class="{'hover-size': recipe.weekday===hoveredWeekday}"
                  @click="showRecipe">
            <img :src="recipe.image" :alt="recipe.alt" class="recipe-img">
            <figcaption>{{ recipe.title }}</figcaption>
          </figure>
          </article>
        `,
    data() {
        return {
            hoveredWeekday: '',
        }
    },
    methods: {
        ...mapMutations([
            'hideAll'
        ]),
        showRecipe() {
            this.hideAll()
            this.$store.commit('showRecipe', this.hoveredWeekday)
        },
        position(recipe) {
            switch (recipe.weekday) {
                case 'monday':
                    return '2 / 1 / 3 / 2';
                case 'tuesday':
                    return '2 / 2 / 3 / 3';
                case 'wednesday':
                    return '2 / 3 / 3 / 4';
                case 'thursday':
                    return '2 / 4 / 3 / 5';
                case 'friday':
                    return '2 / 5 / 3 / 6';
                case 'saturday':
                    return '2 / 6 / 3 / 7';
                case 'sunday':
                    return '2 / 7 / 3 / 8';
            }
        }
    },
    computed: mapState([
        'recipes', 'weekdays'
    ])
})

Vue.component('user-interactivity', {
    template: `
          <section id="user-interactivity">
          <article id="optionButtons">
            <button @click="displayForm">Add a recipe</button>
            <button @click="displayRecipes">Show all recipes</button>
            <button @click="displayShoppingList">Show this week's shopping list</button>
          </article>
          <p v-show="showRecipeSavedMsg">Recipe saved!</p>
          <form id="recipe-form"
                v-show="showForm"
                @submit.prevent="addRecipe">
            <p>
              <label for="title">Enter a recipe name:</label>
            </p>
            <p><input id="title"
                      name="title"
                      required
                      v-model="title"></p>
            <p><label for="ingredients">Enter an ingredient:</label></p>
            <p><input id="ingredients"
                      name="ingredients"
                      v-model="ingredientName"></p>
            <p><label for="ingredient-qty">Select a quantity:</label></p>
            <p><input type="number"
                      id="ingredient-qty"
                      name="ingredient-qty"
                      min="1"
                      max="50"
                      v-model="ingredientQty"></p>
            <p><label for="ingredient-weight">Or, enter weight, measurement, etc:</label></p>
            <p><input id="ingredient-weight"
                      name="ingredient-weight"
                      v-model="ingredientWeight"></p>
            <p v-if="ingredientQty && ingredientWeight">Please enter either quantity or free text!</p>
            <p v-if="showIngredientError">Ingredient name required!</p>
            <p>
              <button @click.prevent="addIngredient"
                      :class="{dualOptions: ingredientQty && ingredientWeight}">Add ingredient
              </button>
            </p>
            <p><label for="weekday">Choose a weekday (optional):</label></p>
            <p><select id="weekday"
                       name="weekday"
                       v-model="weekday">
              <option></option>
              <option v-for="weekday in weekdays">{{ weekday }}</option>
            </select></p>
            <p>
              <input type="submit"
                     id="submit"
                     name="submit"
                     value="Save recipe"></p>
            <p>
              <button @click="clearForm" id="cancelForm">Cancel</button>
            </p>
          </form>
          <div>
            <article v-show="showForm" id="reactive-recipe">
              <h2 v-show="title.length || ingredients.length">Your recipe:</h2>
              <h3>{{ title }}</h3>
              <ul>
                <li v-for="(ingredient, index) in ingredients"
                    :key="index">
                  {{ ingredient.ingredientName }} : {{ ingredient.ingredientQty }}{{ ingredient.ingredientWeight }}
                  <i class="far fa-trash-alt"
                     title="remove ingredient"
                     @click="removeIngredient"></i>
                </li>
              </ul>
            </article>
          </div>
          <section id="display">
            <todays-recipe></todays-recipe>
            <recipe-list></recipe-list>
            <shopping-list></shopping-list>
          </section>
          </section>
        `,
    data() {
        return {
            showIngredientError: false,
        }
    },
    methods: {
        ...mapActions([
            'saveRecipe', 'saveRecipeActions', 'saveRecipeUpdate'
        ]),
        ...mapMutations([
            'hideAll', 'showRecipe', 'showRecipes', 'showShoppingList', 'removeDuplicates', 'setCurrentRecipe'
        ]),
        displayForm(){
            this.clearForm()
            this.$store.dispatch('displayForm')
        },
        addIngredient() {
            if (!(this.ingredientWeight && this.ingredientQty)
                && this.ingredientName) {
                let ingredient = {
                    ingredientName: this.ingredientName,
                    ingredientQty: this.ingredientQty,
                    ingredientWeight: this.ingredientWeight,
                    purchased: false
                }
                this.ingredients.push(ingredient)
                this.clearIngredients()
            } else if (!this.ingredientName) {
                this.showIngredientError = true
            }
        },
        removeIngredient(index) {
            this.ingredients.splice(index, 1)
        },
        addRecipe() {
            let recipe = {
                title: this.title,
                ingredients: this.ingredients.slice(),
                weekday: this.weekday,
                image: this.renderImgString,
                alt: this.weekday,
            }
            if (this.update) {
                this.saveRecipeUpdate(recipe)
            } else {
                this.saveRecipe(recipe)
            }
            this.clearForm()
            this.saveRecipeActions(recipe)
        },
        clearForm() {
            this.ingredients = []
            this.title = ''
            this.weekday = ''
            this.clearIngredients()
            this.setCurrentRecipe('')
            this.hideAll()
        },
        clearIngredients() {
            this.ingredientQty = ''
            this.ingredientName = ''
            this.ingredientWeight = ''
            this.showIngredientError = false
        },
        displayRecipes() {
            this.setCurrentRecipe('')
            this.hideAll()
            this.showRecipes()
        },
        displayShoppingList() {
            this.hideAll()
            this.showShoppingList()
        }
    },
    computed: {
        ...mapState([
            'recipes', 'weekdays', 'currentRecipe', 'update', 'showForm', 'showRecipeSavedMsg', 'currentRecipe'
        ]),
        renderImgString() {
            if (this.weekday) {
                return `img/${this.weekday}.jpg`
            } else return ''
        },
        title: {
            get() {
                return this.$store.state.formData.title
            },
            set(title) {
                this.$store.commit('setTitle', title)
            }
        },
        ingredientName: {
            get() {
                return this.$store.state.formData.ingredientName
            },
            set(ingredientName) {
                this.$store.commit('setIngredientName', ingredientName)
            }
        },
        ingredientQty: {
            get() {
                return this.$store.state.formData.ingredientQty
            },
            set(ingredientQty) {
                this.$store.commit('setIngredientQty', ingredientQty)
            }
        },
        ingredientWeight: {
            get() {
                return this.$store.state.formData.ingredientWeight
            },
            set(ingredientWeight) {
                this.$store.commit('setIngredientWeight', ingredientWeight)
            }
        },
        ingredients: {
            get() {
                return this.$store.state.formData.ingredients
            },
            set(ingredients) {
                this.$store.commit('setIngredients', ingredients)
            }
        },
        weekday: {
            get() {
                return this.$store.state.formData.weekday
            },
            set(weekday) {
                this.$store.commit('setWeekday', weekday)
            }
        },
        image: {
            get() {
                return this.$store.state.formData.image
            },
            set(image) {
                this.$store.commit('setImage', image)
            }
        },
        alt: {
            get() {
                return this.$store.state.formData.alt
            },
            set(alt) {
                this.$store.commit('setAlt', alt)
            }
        }
    }
})

Vue.component('todays-recipe', {
    template: `
          <article v-show="showTodaysRecipe" id="todays-recipe">
          <recipe-info :recipe="currentRecipe"></recipe-info>
          </article>
        `,
    data() {
        return {}
    },
    methods: {
        ...mapMutations([
            'removeDuplicates', 'hideAll'
        ])
    },
    computed: mapState([
        'recipes', 'weekdays', 'showTodaysRecipe', 'currentRecipe'
    ])
})
Vue.component('recipe-list', {
    template: `
          <section id="recipe-list" v-show="showRecipes">
          <button id="hide-recipes" @click="hideRecipes">Hide recipes</button>
          <div id="no-recipes-header" v-if="!recipes.length">
            <h2>No recipes saved!</h2>
            <h4>Add one by clicking "Add a recipe" to the left.</h4>
          </div>
          <ul v-else id="recipe-parent-list">
            <li id="recipes-loop"
                v-for="(recipe, index) in recipes"
                :key="index">
              <recipe-info
                  :recipe="recipe"
              ></recipe-info>

            </li>
          </ul>
          </section>
        `,
    data() {
        return {}
    },
    methods: {
        ...mapMutations([
            'removeDuplicates', 'setCurrentRecipe'
        ]),
        hideRecipes() {
            this.$store.commit('hideAll')
        }
    },
    computed: mapState([
        'recipes', 'weekdays', 'showRecipes'
    ])
})

Vue.component('recipe-info', {
    props: {
        recipe: {
            required: true
        }
    },
    template:
        `
                  <article id="recipe-info">
                  <div id="recipe-header">
                    <h3 @click="setCurrentRecipe(recipe)"
                        :class="{'active-title': currentRecipe === recipe}"
                    >{{ recipe.title }}</h3>
                    <i class="far fa-trash-alt"
                       title="delete recipe"
                       v-show="currentRecipe === recipe"
                       @click="deleteRecipe"></i>
                  </div>
                  <div v-show="currentRecipe === recipe">
                    <ul>
                      <li id="ingredient-list"
                          v-for="(ingredient, index) in recipe.ingredients"
                          :key="index">
                        {{ ingredient.ingredientName }} : {{ ingredient.ingredientQty }}
                        {{ ingredient.ingredientWeight }}
                      </li>
                    </ul>
                    <change-weekday></change-weekday>
                    <button id="update-button" @click="updateRecipe">Update recipe info</button>
                  </div>
                  </article>
                `,
    data() {
        return {}
    },
    methods: {
        ...mapMutations([
            'removeDuplicates'
        ]),
        ...mapActions([
            'deleteRecipe'
        ]),
        updateRecipe() {
            this.$store.dispatch('setToCurrent')
            this.$store.dispatch('updateRecipe')
        },
        setCurrentRecipe(recipe) {
            this.$store.commit('setCurrentRecipe', recipe)
        }
    },
    computed: mapState([
        'recipes', 'currentRecipe', 'weekdays'
    ])
})

Vue.component('change-weekday', {
    template: `
          <div id="new-weekday">
          <h4 v-if="currentRecipe.weekday">Change weekday:</h4>
          <h4 v-else>Assign to weekday:</h4>
          <select id="new-weekday-select" name="new-weekday-select" v-model="assignedWeekday">
            <option v-if="currentRecipe.weekday">-- none --</option>
            <option v-for="(weekday, index) in weekdays"
                    :key="index">{{ weekday }}
            </option>
          </select>
          <button @click="assignWeekday">Assign</button>
          </div>
        `,
    data() {
        return {}
    },
    methods: {
        ...mapMutations([
            'removeDuplicates'
        ]),
        ...mapActions([
            'assignWeekday'
        ])
    },
    computed: {
        ...mapState([
            'weekdays', 'currentRecipe'
        ]),
        assignedWeekday: {
            get() {
                return this.$store.state.currentRecipe.weekday
            },
            set(weekday) {
                this.$store.commit('setAssignedWeekday', weekday)
            }
        }
    }
})

Vue.component('shopping-list', {
    template: `
          <article id="shopping-list" v-show="showShoppingList">
          <button id="hide-shoppinglist" @click="hideAll">Hide shopping list</button>
          <h2>This week's shopping list:</h2>
          <ul v-for="(recipe, index) in recipes"
              :key="index"
              v-if="recipe.weekday">
            <li
                v-for="(ingredient, index) in recipe.ingredients"
                :key="index"
                @mouseover="hoveredItem=ingredient"
                @mouseleave="hoveredItem=''"
                :class="{greenMarked: ingredient.purchased}">
              {{ ingredient.ingredientName }} : {{ ingredient.ingredientQty }}{{ ingredient.ingredientWeight }}
              <img v-if="!ingredient.purchased"
                   v-show="hoveredItem===ingredient"
                   @click="changePurchased(ingredient)"
                   src="img/icon/outline_radio_button_unchecked_black_24dp.png"
                   alt="check">
              <img v-if="ingredient.purchased"
                   v-show="hoveredItem===ingredient"
                   @click="changePurchased(ingredient)"
                   src="img/icon/outline_check_circle_black_24dp.png"
                   alt="uncheck">
            </li>
          </ul>
          </article>
        `,
    data() {
        return {
            hoveredItem: ''
        }
    },
    methods: {
        ...mapMutations([
            'hideAll'
        ]),
        ...mapActions([
            'changePurchased'
        ])
    },
    computed: mapState([
        'recipes', 'showShoppingList'
    ])
})

let app = new Vue({
    el: '#app',
    store,
    data: {},
    mounted() {
        this.$store.dispatch('loadRecipes')
    }
})