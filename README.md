# Flex Tour JS

## WORK IN PROGRESS

### *Requirements:*
1. Allow users to create and run tours that introduce their amazing products.
2. Allow users to customize the flow of the tours:
    - Only show step when conditions (plug-in functions return true) are met, if the conditions are not met, the tour would standby.
    - Make sure target of current step exists or visible before displaying step content.
    - Pre-process steps before displaying through plug-in functions.
    - Post-process steps after displaying through plug-in functions.
    - Users can finish the running tours through clicking on the overlay around the target or by clicking on X button.
3. Absolutely never modify the DOM of application (this way it won't interfere with library that maintain the DOM: React, etc.).
4. Create standalone step that can be used to prompt user to run tour if possible as well as transition between multiple tours.
    
### *Design:*
##### General Attributes:
| Attribute | Purpose |
| --- | --- |
| **(Required)** `id` | To distinguish one tour from another. Allow users to select the wanted tour from a sequence of tours that are submitted. |
    
### *Implementations:*

### *Installations:*

### *Testing:*

### KEEPING TRACKS:
Link to Trello Board: https://trello.com/b/EPsXtJYx/flextourjs
Use this keep track of what needs to be done, and which features will be supported.