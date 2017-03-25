class Debug {

    constructor(enabled) {
        this.enabled = enabled;
        if (enabled){
            $('#debug').removeClass('hidden');
        }
    }

    log(value) {
        if (this.enabled) {
        console.log(value);
            if (typeof value == 'string') {
                $('#debug').append('\n' + value);
            }
            else {
                $('#debug').append('\n' + JSON.stringify(value, null, '  ').replace(/\\n/g, '\n'));
            }
        }
    }
}