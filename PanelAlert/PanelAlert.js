define([
    'qlik',
    'jquery',
    'css!./styles.css'
], function(qlik, $) {
    'use strict';

    return {
        template: `
        <div class="extension-container">
            <h2>Update ClickCount Custom Property</h2>
            
            <label for="click-count-number">Set ClickCount to a number:</label>
            <input type="number" id="click-count-number" min="0" value="5" />
            <button class="update-number-button">Update ClickCount (Number)</button>
            
            <label for="click-count-string" style="margin-top: 20px;">Set ClickCount to a string:</label>
            <input type="text" id="click-count-string" value="DefaultString" />
            <button class="update-string-button">Update ClickCount (String)</button>
    
            <div class="update-status"></div>
            <div class="debug-info"></div>
        </div>
    `,
        initialProperties: {
            qHyperCubeDef: {
                qDimensions: [],
                qMeasures: [],
                qInitialDataFetch: [{
                    qWidth: 10,
                    qHeight: 50
                }]
            }
        },
        definition: {
            type: "items",
            component: "accordion",
            items: {
                settings: {
                    uses: "settings"
                }
            }
        },
        paint: function($element, layout) {
            var app = qlik.currApp(this);
        
            // Function to display the current value of ClickCount
            function displayCurrentValue() {
                $element.find('.update-status').html('Fetching current ClickCount...');
                
                // Fetch the current ClickCount value from Qlik's repository
                qlik.callRepository('/qrs/custompropertydefinition/full', 'GET').then(function(response) {
                    var customProperties = response.data;
                    var clickCountProp = customProperties.find(prop => prop.name === 'ClickCount');
                    
                    if (clickCountProp && clickCountProp.choiceValues.length > 0) {
                        var currentValue = clickCountProp.choiceValues[0]; // Get the first value from choiceValues
                        $element.find('.update-status').html('<p style="color: blue;">Current ClickCount: ' + currentValue + '</p>');
                        highlightButton(currentValue); // Highlight the button that corresponds to the current value
                    } else {
                        $element.find('.update-status').html('<p style="color: red;">ClickCount property not found or no value set</p>');
                    }
                }).catch(function(error) {
                    console.error('Error fetching ClickCount:', error);
                    $element.find('.update-status').html('<p style="color: red;">Error fetching ClickCount: ' + error.message + '</p>');
                });
            }
        
            // Function to update the ClickCount property with the selected value
            function updateClickCount(selectedValue) {
                $element.find('.update-status').html('Updating ClickCount to ' + selectedValue + '...');
                
                qlik.callRepository('/qrs/custompropertydefinition/full', 'GET').then(function(response) {
                    var customProperties = response.data;
                    var clickCountProp = customProperties.find(prop => prop.name === 'ClickCount');
                    
                    if (clickCountProp) {
                        clickCountProp.choiceValues = [selectedValue]; // Set the value to the selected SalesX
                        return qlik.callRepository('/qrs/custompropertydefinition/' + clickCountProp.id, 'PUT', clickCountProp);
                    } else {
                        throw new Error('ClickCount property not found');
                    }
                }).then(function() {
                    $element.find('.update-status').html('<p style="color: green;">ClickCount successfully updated to ' + selectedValue + '</p>');
                    highlightButton(selectedValue); // Highlight the button after updating the value
                }).catch(function(error) {
                    console.error('Update error:', error);
                    $element.find('.update-status').html('<p style="color: red;">Error updating ClickCount: ' + error.message + '</p>');
                });
            }
        
            // Function to highlight the selected button
            function highlightButton(selectedValue) {
                $element.find('.sales-button').each(function() {
                    var buttonValue = $(this).data('value');
                    if (buttonValue === selectedValue) {
                        $(this).css('background-color', '#4CAF50'); // Highlight the selected button
                    } else {
                        $(this).css('background-color', ''); // Reset other buttons
                    }
                });
            }
        
            // Create the buttons
            var buttonHtml = `
                <button class="sales-button" data-value="Sales1">Sales1</button>
                <button class="sales-button" data-value="Sales2">Sales2</button>
                <button class="sales-button" data-value="Sales3">Sales3</button>
                <button class="sales-button" data-value="Sales4">Sales4</button>
                <div class="update-status"></div>
            `;
        
            $element.html(buttonHtml);
        
            // Attach event listeners to each button
            $element.find('.sales-button').on('click', function() {
                var selectedValue = $(this).data('value'); // Get the value associated with the clicked button
                updateClickCount(selectedValue); // Send the selected value to the Qlik Repository
            });
        
            // Fetch and display the current value of ClickCount when the app is loaded
            displayCurrentValue();
        
            return qlik.Promise.resolve();
        }
        
        
        
        
    };
});