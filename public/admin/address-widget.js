(function () {
  var googlePlacesPromise = null;

  function mapsUrl(address, placeId) {
    if (!address) return '';

    var url = new URL('https://www.google.com/maps/search/');
    url.searchParams.set('api', '1');
    url.searchParams.set('query', address);
    if (placeId) url.searchParams.set('query_place_id', placeId);
    return url.toString();
  }

  function locationValue(value) {
    if (!value) return { address: '', placeId: '', mapsUrl: '' };
    if (typeof value.toJS === 'function') value = value.toJS();
    if (typeof value === 'string') {
      return { address: value, placeId: '', mapsUrl: mapsUrl(value) };
    }

    return {
      address: value.address || '',
      placeId: value.placeId || '',
      mapsUrl: value.mapsUrl || mapsUrl(value.address || '', value.placeId || ''),
    };
  }

  function loadGooglePlaces() {
    if (window.google && window.google.maps && window.google.maps.importLibrary) {
      return window.google.maps.importLibrary('places');
    }
    if (googlePlacesPromise) return googlePlacesPromise;

    var apiKey = window.BINGE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) {
      return Promise.reject(new Error('Google address suggestions are not configured.'));
    }

    googlePlacesPromise = new Promise(function (resolve, reject) {
      var callbackName = '__bingeGoogleMapsReady';
      var script = document.createElement('script');

      window[callbackName] = function () {
        delete window[callbackName];
        window.google.maps.importLibrary('places').then(resolve, reject);
      };

      script.async = true;
      script.onerror = function () {
        delete window[callbackName];
        googlePlacesPromise = null;
        reject(new Error('Google address suggestions could not load.'));
      };
      script.src = 'https://maps.googleapis.com/maps/api/js?key='
        + encodeURIComponent(apiKey)
        + '&loading=async&v=weekly&callback='
        + callbackName;
      document.head.appendChild(script);
    });

    return googlePlacesPromise;
  }

  window.registerBingeAddressWidget = function (CMS, createClass, h) {
    var AddressControl = createClass({
      getInitialState: function () {
        return {
          activeIndex: -1,
          message: '',
          places: null,
          suggestions: [],
        };
      },

      componentDidMount: function () {
        var self = this;
        loadGooglePlaces()
          .then(function (places) {
            self.setState({
              places: places,
              sessionToken: new places.AutocompleteSessionToken(),
            });
          })
          .catch(function (error) {
            self.setState({ message: error.message });
          });
      },

      componentWillUnmount: function () {
        clearTimeout(this.searchTimer);
        clearTimeout(this.blurTimer);
      },

      emitLocation: function (address, placeId) {
        this.props.onChange({
          address: address,
          placeId: placeId || '',
          mapsUrl: mapsUrl(address, placeId),
        });
      },

      handleChange: function (event) {
        var self = this;
        var address = event.target.value;

        this.emitLocation(address, '');
        this.setState({ activeIndex: -1, suggestions: [] });
        clearTimeout(this.searchTimer);

        if (!this.state.places || address.trim().length < 3) return;

        this.searchTimer = setTimeout(function () {
          self.fetchSuggestions(address.trim());
        }, 250);
      },

      fetchSuggestions: function (input) {
        var self = this;
        var requestId = (this.requestId || 0) + 1;
        this.requestId = requestId;
        this.setState({ message: 'Finding addresses...' });

        this.state.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: input,
          includedRegionCodes: ['ca'],
          language: 'en',
          region: 'ca',
          sessionToken: this.state.sessionToken,
        })
          .then(function (response) {
            if (self.requestId !== requestId) return;
            var suggestions = response.suggestions
              .map(function (suggestion) { return suggestion.placePrediction; })
              .filter(Boolean)
              .slice(0, 6);
            self.setState({
              activeIndex: -1,
              message: suggestions.length ? '' : 'No matching addresses found.',
              suggestions: suggestions,
            });
          })
          .catch(function () {
            if (self.requestId !== requestId) return;
            self.setState({
              message: 'Suggestions are unavailable. You can still enter the address.',
              suggestions: [],
            });
          });
      },

      selectSuggestion: function (prediction) {
        var self = this;
        var place = prediction.toPlace();
        this.setState({ message: 'Saving address...', suggestions: [] });

        place.fetchFields({ fields: ['formattedAddress'] })
          .then(function () {
            var address = place.formattedAddress || prediction.text.text;
            self.emitLocation(address, prediction.placeId);
            self.setState({
              activeIndex: -1,
              message: 'Google address selected.',
              sessionToken: new self.state.places.AutocompleteSessionToken(),
            });
          })
          .catch(function () {
            self.emitLocation(prediction.text.text, prediction.placeId);
            self.setState({
              activeIndex: -1,
              message: 'Google address selected.',
              sessionToken: new self.state.places.AutocompleteSessionToken(),
            });
          });
      },

      handleKeyDown: function (event) {
        var suggestions = this.state.suggestions;
        if (!suggestions.length) return;

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          this.setState({
            activeIndex: Math.min(this.state.activeIndex + 1, suggestions.length - 1),
          });
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          this.setState({ activeIndex: Math.max(this.state.activeIndex - 1, 0) });
        } else if (event.key === 'Enter' && this.state.activeIndex >= 0) {
          event.preventDefault();
          this.selectSuggestion(suggestions[this.state.activeIndex]);
        } else if (event.key === 'Escape') {
          this.setState({ activeIndex: -1, suggestions: [] });
        }
      },

      handleBlur: function () {
        var self = this;
        this.blurTimer = setTimeout(function () {
          self.setState({ activeIndex: -1, suggestions: [] });
        }, 150);
      },

      render: function () {
        var self = this;
        var value = locationValue(this.props.value);
        var listId = this.props.forID + '-suggestions';

        return h('div', { className: this.props.classNameWrapper + ' bt-address-widget' },
          h('input', {
            id: this.props.forID,
            type: 'text',
            value: value.address,
            placeholder: 'Start typing a venue or street address',
            autoComplete: 'off',
            role: 'combobox',
            'aria-autocomplete': 'list',
            'aria-controls': listId,
            'aria-expanded': this.state.suggestions.length > 0,
            'aria-activedescendant': this.state.activeIndex >= 0
              ? listId + '-' + this.state.activeIndex
              : undefined,
            onBlur: this.handleBlur,
            onChange: this.handleChange,
            onKeyDown: this.handleKeyDown,
          }),
          this.state.suggestions.length
            ? h('ul', { className: 'bt-address-suggestions', id: listId, role: 'listbox' },
              this.state.suggestions.map(function (prediction, index) {
                return h('li', {
                  id: listId + '-' + index,
                  key: prediction.placeId,
                  role: 'option',
                  'aria-selected': self.state.activeIndex === index,
                  className: self.state.activeIndex === index ? 'is-active' : '',
                  onMouseDown: function (event) { event.preventDefault(); },
                  onClick: function () { self.selectSuggestion(prediction); },
                },
                h('strong', {}, prediction.mainText ? prediction.mainText.text : prediction.text.text),
                prediction.secondaryText
                  ? h('span', {}, prediction.secondaryText.text)
                  : null);
              }))
            : null,
          h('p', { className: 'bt-address-message', role: 'status' },
            this.state.message || (value.mapsUrl ? 'This address will open in Google Maps.' : '')),
        );
      },
    });

    var AddressPreview = createClass({
      render: function () {
        var value = locationValue(this.props.value);
        return h('span', {}, value.address || 'No address');
      },
    });

    CMS.registerWidget('google-address', AddressControl, AddressPreview);
  };
})();
