import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type FoodEntry = {
    id : Nat;
    date : Text;
    name : Text;
    calories : Nat;
    protein : Float;
    carbs : Float;
    fat : Float;
    mealTag : Text;
  };

  public type DailyGoals = {
    calories : Nat;
    protein : Float;
    carbs : Float;
    fat : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  let defaultGoals : DailyGoals = {
    calories = 2000;
    protein = 150.0;
    carbs = 250.0;
    fat = 65.0;
  };

  let nextEntryId = Map.empty<Principal, Nat>();
  let foodEntries = Map.empty<Principal, List.List<FoodEntry>>();
  let userGoals = Map.empty<Principal, DailyGoals>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Food Entry Management
  public shared ({ caller }) func addFoodEntry(date : Text, name : Text, calories : Nat, protein : Float, carbs : Float, fat : Float, mealTag : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add food entries");
    };

    let entryId = switch (nextEntryId.get(caller)) {
      case (null) { 1 };
      case (?id) { id + 1 };
    };

    let newEntry : FoodEntry = {
      id = entryId;
      date;
      name;
      calories;
      protein;
      carbs;
      fat;
      mealTag;
    };

    let currentEntries = switch (foodEntries.get(caller)) {
      case (null) { List.empty<FoodEntry>() };
      case (?entries) { entries };
    };

    currentEntries.add(newEntry);
    foodEntries.add(caller, currentEntries);
    nextEntryId.add(caller, entryId);

    entryId;
  };

  public query ({ caller }) func getFoodEntriesByDate(date : Text) : async [FoodEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view food entries");
    };

    switch (foodEntries.get(caller)) {
      case (null) { [] };
      case (?entries) {
        entries.filter(func(entry) { entry.date == date }).toArray();
      };
    };
  };

  public shared ({ caller }) func deleteFoodEntry(entryId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete food entries");
    };

    switch (foodEntries.get(caller)) {
      case (null) { Runtime.trap("No entries found") };
      case (?entries) {
        let filteredEntries = entries.filter(func(entry) { entry.id != entryId });
        if (filteredEntries.size() == entries.size()) {
          Runtime.trap("Entry not found");
        };
        foodEntries.add(caller, filteredEntries);
      };
    };
  };

  // Daily Goals Management
  public shared ({ caller }) func setDailyGoals(calories : Nat, protein : Float, carbs : Float, fat : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set daily goals");
    };

    userGoals.add(
      caller,
      {
        calories;
        protein;
        carbs;
        fat;
      },
    );
  };

  public query ({ caller }) func getDailyGoals() : async DailyGoals {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily goals");
    };
    
    switch (userGoals.get(caller)) {
      case (null) { defaultGoals };
      case (?goals) { goals };
    };
  };
};
