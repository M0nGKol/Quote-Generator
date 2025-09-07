import "dotenv/config";
import  db  from "@/db";
import { quotes } from "@/db/schema";

const seedQuotes = [
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
    { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Happiness depends upon ourselves.", author: "Aristotle" },
    { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Don’t let yesterday take up too much of today.", author: "Will Rogers" },
    { text: "Your time is limited, so don’t waste it living someone else’s life.", author: "Steve Jobs" },
    { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
    { text: "I never dreamed about success. I worked for it.", author: "Estée Lauder" },
    { text: "Opportunities don't happen, you create them.", author: "Chris Grosser" },
    { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Everything you’ve ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  ];
  

async function main() {
  await db.insert(quotes).values(seedQuotes);
  console.log("Quotes seeded");
  process.exit(0);
}

main();
