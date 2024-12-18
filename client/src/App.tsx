import { Switch, Route } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Home } from "@/pages/Home";
import { Articles } from "@/pages/Articles";
import { Mission } from "@/pages/Mission";
import { ArticleDetails } from "@/pages/ArticleDetails";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/articles" component={Articles} />
          <Route path="/mission" component={Mission} />
          <Route path="/article/:id" component={ArticleDetails} />
          <Route path="/profile">
            {(params) => <Profile address={window.ethereum?.selectedAddress || ''} />}
          </Route>
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default App;
