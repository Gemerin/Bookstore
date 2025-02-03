import readline from 'readline';
import axios from 'axios';

class BookStoreConsole {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.userId = null
    }

    showMainMenu() {
        console.log(`
   ********************************************************************************
   ***                                                                          ***
   ***                       Welcome to the Book Store                          ***
   ***                                                                          ***
   ********************************************************************************
    1. Member Log In
    2. New Member Registration
    3. Quit
  `);

        this.rl.question('Type in your option: ', async (option) => {
            switch (option) {
                case '1':
                    await this.login();
                    break;
                case '2':
                    await this.register();
                    break;
                case '3':
                    this.rl.close();
                    process.exit(0);
                    break;
                default:
                    console.log('Invalid option. Please try again.');
                    this.showMainMenu();
                    break;
            }
        });
    }

    async login() {
        this.rl.question('Enter email: ', (email) => {
            this.rl.question('Enter password: ', async (password) => {
                try {
                    const response = await axios.post('http://localhost:3000/users/login', { email, password });
                    if (response.data.message) {
                        console.log(response.data.message);
                    } else {
                        console.log('No message in response data');
                    }
                    this.userId = response.data.userId
                    this.showUserMenu();
                } catch (error) {
                    if (error.response) {
                        console.error('Error logging in:', error.response.data.message);
                    }
                    this.showMainMenu();
                }
            });
        });
    }

    async register() {
        console.log('Welcome to The Online Book Store \n New Member Registration');
        this.rl.question('Enter First Name: ', (fname) => {
            this.rl.question('Enter Last Name: ', (lname) => {
                this.rl.question('Enter Street Name: ', (address) => {
                    this.rl.question('Enter City: ', (city) => {
                        this.rl.question('Enter Zip Code: ', (zip) => {
                            this.rl.question('Enter Phone: ', (phone) => {
                                this.rl.question('Enter Email: ', (email) => {
                                    this.rl.question('Enter Password: ', async (password) => {
                                        try {
                                            const response = await axios.post('http://localhost:3000/users/register', {
                                                fname,
                                                lname,
                                                address,
                                                city,
                                                zip,
                                                phone: phone || null,
                                                email,
                                                password
                                            });
                                            console.log(response.data.message);
                                            this.rl.question('You have Registered Successfully! \n Press Enter to return to the menu...', () => {
                                                this.showMainMenu();
                                            });
                                        } catch (error) {
                                            console.error('Error registering:', error.response.data.error);
                                            this.rl.question('Press Enter to return to the menu...', () => {
                                                this.showMainMenu();
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }


    showUserMenu() {
        console.log(`\n
       ********************************************************************************
       ***                                                                          ***
       ***                       Welcome to the Book Store                          ***
       ***                            Member Menu                                   ***
       ***                                                                          ***
       ********************************************************************************\n
        User Menu
        1. Browse by Subject
        2. Search by Author/Title
        3. Check Out
        4. Log Out
      `);

        this.rl.question('Please choose an option: ', async (option) => {
            switch (option) {
                case '1':
                    await this.browseBySubject();
                    break;
                case '2':
                    await this.searchByAuthorOrTitle();
                    break;
                case '3':
                    await this.checkOut();
                    break;
                case '4':
                    console.log('Logged out successfully.');
                    this.showMainMenu();
                    break;
                default:
                    console.log('Invalid option. Please try again.');
                    this.showUserMenu();
                    break;
            }
        });
    }

    async browseBySubject() {
        try {
            const response = await axios.get('http://localhost:3000/books/subjects');
            const subjects = response.data;

            console.log('Subjects:');
            subjects.forEach((subject, index) => {
                console.log(`${index + 1}. ${subject}`);
            });

            this.rl.question('Choose a subject: ', async (subjectIndex) => {
                const subject = subjects[subjectIndex - 1];
                await this.showBooksBySubject(subject, 0);
            });
        } catch (error) {
            console.error('Error fetching subjects:', error.message);
            this.showUserMenu();
        }
    }

    async showBooksBySubject(subject, startIndex) {
        try {
            const response = await axios.get(`http://localhost:3000/books?subject=${encodeURIComponent(subject)}`);
            const books = response.data;

            if (books.length === 0) {
                console.log('No books available for this subject.');
                this.showUserMenu();
                return;
            }

            console.log(`${books.length} Books available for this Subject`);
            const endIndex = Math.min(startIndex + 2, books.length);
            for (let i = startIndex; i < endIndex; i++) {
                const book = books[i];
                console.log(`ISBN: ${book.isbn}, Title: ${book.title}, Author: ${book.author}`);
            }


            this.rl.question('Enter ISBN to put in the cart, press ENTER to return to the main menu, or press n ENTER to continue browsing: ', async (input) => {
                if (input === '') {
                    this.showUserMenu();
                } else if (input.toLowerCase() === 'n') {
                    if (endIndex < books.length) {
                        await this.showBooksBySubject(subject, endIndex);
                    } else {
                        console.log('No more books to display.');
                        this.showUserMenu();
                    }
                } else {
                    this.rl.question('Enter quantity: ', async (quantity) => {
                        try {
                            console.log('Current User ID:', this.userId);
                            const response = await axios.post('http://localhost:3000/cart/add', { userId: this.userId, isbn: input, qty: parseInt(quantity) });
                            console.log(`Book with ISBN ${input} added to the cart. Quantity: ${response.data.qty}`);
                        } catch (error) {
                            if (error.response && error.response.data.error === 'ISBN does not exist in books table') {
                                console.error('Error adding book to cart: ISBN does not exist in books table');
                            } else {
                                console.error('Error adding book to cart:', error.message);
                            }
                        }
                        this.showUserMenu();
                    })
                }
            });
        } catch (error) {
            console.error('Error fetching books:', error.message);
            this.showUserMenu();
        }
    }

    async searchByAuthorOrTitle() {
        console.log(`
        Search Menu
        1. Author Search
        2. Title Search
        3. Go Back to Main Menu
      `);
        this.rl.question('Please choose an option: ', async (option) => {
            switch (option) {
                case '1':
                    await this.searchBy('author');
                    break;
                case '2':
                    await this.searchBy('title');
                    break;
                case '3':
                    this.showUserMenu();
                    break;
                default:
                    console.log('Invalid option. Please try again.');
                    this.searchByAuthorOrTitle();
                    break;
            }
        });
    }

    async searchBy(type) {
        this.rl.question(`Enter ${type} substring: `, async (substring) => {
            try {
                const response = await axios.get(`http://localhost:3000/books/search?${type}=${encodeURIComponent(substring)}`);
                const books = response.data;

                if (books.length === 0) {
                    console.log(`No books found with ${type} containing "${substring}".`);
                    this.searchByAuthorOrTitle();
                    return;
                }

                console.log(`${books.length} Books found:`);
                await this.displayBooks(books, 0);
            } catch (error) {
                console.error(`Error searching by ${type}:`, error.message);
                this.searchByAuthorOrTitle();
            }
        });
    }

    async displayBooks(books, startIndex) {
        const endIndex = Math.min(startIndex + 3, books.length);
        for (let i = startIndex; i < endIndex; i++) {
            const book = books[i];
            console.log(`ISBN: ${book.isbn}, Title: ${book.title}, Author: ${book.author}`);
        }

        this.rl.question('Enter ISBN to put in the cart, press ENTER to return to the main menu, or press n ENTER to continue browsing: ', async (input) => {
            if (input === '') {
                this.showUserMenu();
            } else if (input.toLowerCase() === 'n') {
                if (endIndex < books.length) {
                    await this.displayBooks(books, endIndex);
                } else {
                    console.log('No more books to display.');
                    this.showUserMenu();
                }
            } else {
                this.rl.question('Enter quantity: ', async (quantity) => {
                    try {
                        console.log('Current User ID:', this.userId);
                        const response = await axios.post('http://localhost:3000/cart/add', { userId: this.userId, isbn: input, qty: parseInt(quantity) });
                        console.log(`Book with ISBN ${input} added to the cart. Quantity: ${response.data.qty}`);
                    } catch (error) {
                        if (error.response && error.response.data.error === 'ISBN does not exist in books table') {
                            console.error('Error adding book to cart: ISBN does not exist in books table');
                        } else {
                            console.error('Error adding book to cart:', error.message);
                        }
                    }
                    this.showUserMenu();
                });
            }
        });
    }

    async checkOut() {
        try {
            const response = await axios.get(`http://localhost:3000/cart/${this.userId}`);
            const cartItems = response.data;

            if (cartItems.length === 0) {
                console.log('Your cart is empty.');
                this.showUserMenu();
                return;
            }

            let totalPrice = 0;
             console.log('Current Cart Content \n-------------------------------------------------------------------------------------------------');
        console.log(`ISBN            Title                                                             $   QTY  Total`);
        console.log('---------------------------------------------------------------------------------------------------');
        cartItems.forEach(item => {
            const itemTotal = item.qty * item.price;
            totalPrice += itemTotal;
            const maxTitleLength = 60;
            let title = item.title;
            if (title.length > maxTitleLength) {
                const firstLine = title.substring(0, maxTitleLength);
                const secondLine = title.substring(maxTitleLength);
                console.log(`${item.isbn.padEnd(15)} ${firstLine.padEnd(60)} ${item.price.toString().padStart(8)} ${item.qty.toString().padStart(3)} ${itemTotal.toString().padStart(4)}`);
                console.log(`               ${secondLine}`);
            } else {
                console.log(`${item.isbn.padEnd(15)} ${title.padEnd(60)} ${item.price.toString().padStart(8)} ${item.qty.toString().padStart(3)} ${itemTotal.toString().padStart(4)}`);
            }
        });
        console.log('---------------------------------------------------------------------------------------------------');
        console.log(`Total Price: ${totalPrice}`);
        console.log('---------------------------------------------------------------------------------------------------');


            this.rl.question('Proceed to check out (Y/N)?: ', async (answer) => {
                if (answer.toLowerCase() === 'y') {
                    try {
                        await axios.post('http://localhost:3000/orders', { userId: this.userId, cartItems });
                        console.log('Order placed successfully.');
                        // Fetch user address for the invoice
                        const userResponse = await axios.get(`http://localhost:3000/users/${this.userId}`);
                        const { address, city, zip, fname, lname } = userResponse.data;

                        // Calculate shipment date (one week from now)
                        const shipmentDate = new Date();
                        shipmentDate.setDate(shipmentDate.getDate() + 7);
                        const formattedShipmentDate = shipmentDate.toDateString();

                        console.log('Invoice:');
                        console.log('-----------------------------------------------------------------------------------------');
                        console.log(`Name: ${fname} ${lname} `)
                        console.log(`Shipping Address: ${address} \n ${city} \n ${zip}`);
                        console.log(`Shipment Date: ${formattedShipmentDate}`);
                        console.log('-----------------------------------------------------------------------------------------');
                        console.log(`ISBN            Title                                                        $   QTY  Total`);
                        ('-----------------------------------------------------------------------------------------');
                        cartItems.forEach(item => {
                            const itemTotal = item.qty * item.price;
                            const maxTitleLength = 55;
                            let title = item.title;
                            if (title.length > maxTitleLength) {
                                const firstLine = title.substring(0, maxTitleLength);
                                const secondLine = title.substring(maxTitleLength);
                                console.log(`${item.isbn.padEnd(15)} ${firstLine.padEnd(55)} ${item.price.toString().padStart(8)} ${item.qty.toString().padStart(2)} ${itemTotal.toString().padStart(4)}`);
                                console.log(`               ${secondLine}`);
                            } else {
                                console.log(`${item.isbn.padEnd(15)} ${title.padEnd(55)} ${item.price.toString().padStart(8)} ${item.qty.toString().padStart(2)} ${itemTotal.toString().padStart(4)}`);
                            }
                        });
                        console.log('-----------------------------------------------------------------------------------------');
                        console.log(`Total Price: ${totalPrice}.`);
                        console.log('-----------------------------------------------------------------------------------------');
                    } catch (error) {
                        console.error('Error placing order:', error.message);
                    }
                    this.showUserMenu();
                } else {
                    this.showUserMenu();
                }
            });
        } catch (error) {
            console.error('Error fetching cart items:', error.message);
            this.showUserMenu();
        }

    }
}
export default BookStoreConsole;