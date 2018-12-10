const WORD_DELAY = 100;
let readPos = 0;
let totalWords = 0;
let readingMode = false;

$.fn.scrollView = function () {
    return this.each(function () {
        $('html, body').scrollTop($(this).offset().top - screen.height / 4);
    });
};

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

const activeScrollReader = () => {
    if (!readingMode) {
        readingMode = true;
        $("p").each((i,p) => {
            let words = $(p).text().split(' ');
            totalWords += words.length;
            words = words.reduce((words, word) => {
                if (word.length) words.push(`<span class="reaid-word">${word}</span>`);
                return words;
            }, []).join(" ");
            $(p).html(words);
        });

        $('html,body').css('cursor','crosshair');


        window.addEventListener('wheel', (e) => {
            if (!$(".reaid-word.active").length) return;
            e.preventDefault();
            next_word(e);
        });

        $(".reaid-word").on('click', function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                return;
            } else {
                $(".reaid-word.active").removeClass("active");
                $(this).addClass("active");
            }
        });

        const get_next = e => {
            let next = e.next();
            if (!next.length) {
                next = e.parent().next().find(".reaid-word:eq(0)");
            }
            return next;
        };

        const get_prev = e => {
            let prev = e.prev();
            if (!prev.length) {
                prev = e.parent().prev().find(".reaid-word:last-child");
            }
            return prev;
        };

        const next_word = throttle((e) => {
            let next = (e.deltaY > 0) ? true : false;
            let curr = $(".reaid-word.active");
            let target = next ? get_next(curr) : get_prev(curr);
            if (target.length) {
                target.addClass("active");
                if (target.offset().top > ($("html, body").scrollTop() + screen.height / 2 + screen.height / 5)) {
                    target.scrollView();
                }
                curr.removeClass("active");
            }
        }, WORD_DELAY);

    } else {
        window.location = window.location.href;
    }
};

browser.runtime.onMessage.addListener((e) => {
    if (e === "active-scroll-reader") {
        activeScrollReader();
    }
});
